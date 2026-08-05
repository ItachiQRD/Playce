"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENT_DEMO_USER_ID,
  demoApplications,
  demoComments,
  demoConversations,
  demoExperiences,
  demoMessages,
  demoNotifications,
  demoOpportunities,
  demoPosts,
  demoProfiles,
  demoReports,
  getDemoUser,
  sports,
} from "@/lib/demo-data";
import type {
  Application,
  ApplicationStatus,
  Comment,
  Conversation,
  Message,
  Notification,
  Opportunity,
  Post,
  Profile,
  Report,
  UserRole,
} from "@/lib/types";
import {
  calculateCompleteness,
  matchingScore,
  slugify,
  type MatchResult,
} from "@/lib/utils";
import { track } from "@/lib/analytics";
import {
  applySignalReward,
  createInitialSignal,
  rollDailySignal,
  type SignalAction,
  type SignalState,
} from "@/lib/signal";

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
}

interface DemoStore {
  auth: AuthState;
  profiles: Profile[];
  posts: Post[];
  comments: Comment[];
  opportunities: Opportunity[];
  applications: Application[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  experiences: typeof demoExperiences;
  sports: typeof sports;
  signal: SignalState;
  lastSignalGain: number;
  loginAs: (profileId: string) => void;
  logout: () => void;
  register: (data: {
    email: string;
    full_name: string;
    role: UserRole;
    sport_id: string;
    password?: string;
  }) => Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  completeOnboarding: (data: Partial<Profile>) => void;
  createPost: (data: Partial<Post> & { content: string }) => Post;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  createOpportunity: (data: Omit<Opportunity, "id" | "author_id" | "author" | "applications_count" | "created_at" | "sport"> & { sport_id: string }) => Opportunity;
  applyToOpportunity: (opportunityId: string, message: string) => Application | null;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  sendMessage: (conversationId: string, content: string) => void;
  startConversation: (otherUserId: string, initialMessage?: string) => string;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  createReport: (data: Omit<Report, "id" | "reporter_id" | "status" | "created_at">) => void;
  followUser: (userId: string) => void;
  suspendUser: (userId: string, suspend: boolean) => void;
  verifyUser: (userId: string) => void;
  resolveReport: (reportId: string, status: "resolved" | "dismissed") => void;
  getMatchScore: (opportunity: Opportunity, profile?: Profile | null) => MatchResult;
  requestVerification: () => void;
  awardSignal: (action: SignalAction, questHint?: "discover" | "engage" | "publish") => number;
  clearSignalGain: () => void;
}

const DemoContext = createContext<DemoStore | null>(null);

const STORAGE_KEY = "playce-demo-v1";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    onboardingComplete: false,
  });
  const [profiles, setProfiles] = useState<Profile[]>(demoProfiles);
  const [posts, setPosts] = useState<Post[]>(demoPosts);
  const [comments, setComments] = useState<Comment[]>(demoComments);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(demoOpportunities);
  const [applications, setApplications] = useState<Application[]>(demoApplications);
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [reports, setReports] = useState<Report[]>(demoReports);
  const [experiences] = useState(demoExperiences);
  const [signal, setSignal] = useState<SignalState>(createInitialSignal);
  const [lastSignalGain, setLastSignalGain] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.auth) setAuth(data.auth);
        if (data.profiles) setProfiles(data.profiles);
        if (data.posts) setPosts(data.posts);
        if (data.opportunities) setOpportunities(data.opportunities);
        if (data.applications) setApplications(data.applications);
        if (data.notifications) setNotifications(data.notifications);
        if (data.conversations) setConversations(data.conversations);
        if (data.messages) setMessages(data.messages);
        if (data.reports) setReports(data.reports);
        if (data.comments) setComments(data.comments);
        if (data.signal) setSignal(rollDailySignal(data.signal));
        else setSignal(rollDailySignal(createInitialSignal()));
      } else {
        const user = getDemoUser(CURRENT_DEMO_USER_ID);
        setAuth({ user, isAuthenticated: true, onboardingComplete: true });
        setSignal(rollDailySignal(createInitialSignal()));
      }
    } catch {
      const user = getDemoUser(CURRENT_DEMO_USER_ID);
      setAuth({ user, isAuthenticated: true, onboardingComplete: true });
      setSignal(rollDailySignal(createInitialSignal()));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        auth,
        profiles,
        posts,
        opportunities,
        applications,
        notifications,
        conversations,
        messages,
        reports,
        comments,
        signal,
      })
    );
  }, [
    hydrated,
    auth,
    profiles,
    posts,
    opportunities,
    applications,
    notifications,
    conversations,
    messages,
    reports,
    comments,
    signal,
  ]);

  const awardSignal = useCallback(
    (action: SignalAction, questHint?: "discover" | "engage" | "publish") => {
      let gained = 0;
      setSignal((prev) => {
        const result = applySignalReward(prev, action, questHint);
        gained = result.gained;
        return result.state;
      });
      setLastSignalGain(gained);
      return gained;
    },
    []
  );

  const clearSignalGain = useCallback(() => setLastSignalGain(0), []);

  const loginAs = useCallback(
    (profileId: string) => {
      const user = profiles.find((p) => p.id === profileId) ?? getDemoUser(profileId);
      setAuth({
        user,
        isAuthenticated: true,
        onboardingComplete: (user.completeness ?? 0) >= 60,
      });
    },
    [profiles]
  );

  const logout = useCallback(() => {
    setAuth({ user: null, isAuthenticated: false, onboardingComplete: false });
  }, []);

  const register = useCallback(
    (data: {
      email: string;
      full_name: string;
      role: UserRole;
      sport_id: string;
    }) => {
      const id = `user-${Date.now()}`;
      const handle = slugify(data.full_name) || `user-${Date.now()}`;
      const sport = sports.find((s) => s.id === data.sport_id) ?? null;
      const profile: Profile = {
        id,
        email: data.email,
        handle,
        full_name: data.full_name,
        role: data.role,
        sport_id: data.sport_id,
        sport,
        availability: "open",
        languages: ["fr"],
        visibility: "public",
        allow_direct_contact: true,
        email_verified: false,
        identity_verified: false,
        completeness: 30,
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfiles((prev) => [profile, ...prev]);
      setAuth({ user: profile, isAuthenticated: true, onboardingComplete: false });
      return profile;
    },
    []
  );

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setAuth((prev) => {
      if (!prev.user) return prev;
      const completeness = calculateCompleteness({ ...prev.user, ...updates });
      const next = {
        ...prev.user,
        ...updates,
        completeness,
        updated_at: new Date().toISOString(),
      };
      if (completeness >= 60) track("activation_profile_60");
      if (completeness >= 80) track("activation_profile_80");
      setProfiles((list) => list.map((p) => (p.id === next.id ? next : p)));
      return { ...prev, user: next };
    });
  }, []);

  const completeOnboarding = useCallback((data: Partial<Profile>) => {
    setAuth((prev) => {
      if (!prev.user) return prev;
      const next = {
        ...prev.user,
        ...data,
        completeness: calculateCompleteness({ ...prev.user, ...data }),
        updated_at: new Date().toISOString(),
      };
      setProfiles((list) => list.map((p) => (p.id === next.id ? next : p)));
      return { user: next, isAuthenticated: true, onboardingComplete: true };
    });
  }, []);

  const createPost = useCallback(
    (data: Partial<Post> & { content: string }) => {
      const author = auth.user!;
      const post: Post = {
        id: `post-${Date.now()}`,
        author_id: author.id,
        author,
        type: data.type ?? "text",
        content: data.content,
        media_url: data.media_url,
        thumbnail_url: data.thumbnail_url,
        sport_id: data.sport_id ?? author.sport_id ?? undefined,
        hashtags: data.hashtags ?? [],
        likes_count: 0,
        comments_count: 0,
        saves_count: 0,
        liked_by_me: false,
        created_at: new Date().toISOString(),
      };
      setPosts((prev) => [post, ...prev]);
      track("first_post", { type: post.type });
      awardSignal(
        post.type === "reel" ? "publish_reel" : "publish",
        "publish"
      );
      return post;
    },
    [auth.user, awardSignal]
  );

  const toggleLike = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const liked = !p.liked_by_me;
          if (liked) awardSignal("like", "engage");
          return {
            ...p,
            liked_by_me: liked,
            likes_count: p.likes_count + (liked ? 1 : -1),
          };
        })
      );
    },
    [awardSignal]
  );

  const addComment = useCallback(
    (postId: string, content: string) => {
      if (!auth.user) return;
      const comment: Comment = {
        id: `c-${Date.now()}`,
        post_id: postId,
        author_id: auth.user.id,
        author: auth.user,
        content,
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, comment]);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
        )
      );
      awardSignal("comment", "engage");
    },
    [auth.user, awardSignal]
  );

  const getMatchScore = useCallback(
    (opportunity: Opportunity, profile?: Profile | null): MatchResult => {
      const p = profile ?? auth.user;
      if (!p) {
        return {
          score: 0,
          reasons: [],
          breakdown: (
            ["sport", "position", "level", "location", "availability"] as const
          ).map((key) => ({
            key,
            weight: { sport: 30, position: 25, level: 20, location: 15, availability: 10 }[key],
            matched: false,
          })),
        };
      }
      return matchingScore({
        sportMatch: p.sport_id === opportunity.sport_id,
        positionMatch: !!p.position && p.position === opportunity.position,
        levelMatch: !!p.level && p.level === opportunity.level,
        locationMatch:
          (!!p.city && p.city === opportunity.city) ||
          (!!p.country && p.country === opportunity.country),
        availabilityMatch: p.availability === "open" || p.availability === "looking",
      });
    },
    [auth.user]
  );

  const createOpportunity = useCallback(
    (
      data: Omit<
        Opportunity,
        "id" | "author_id" | "author" | "applications_count" | "created_at" | "sport"
      > & { sport_id: string }
    ) => {
      const author = auth.user!;
      const sport = sports.find((s) => s.id === data.sport_id) ?? null;
      const opp: Opportunity = {
        ...data,
        id: `opp-${Date.now()}`,
        author_id: author.id,
        author,
        sport,
        applications_count: 0,
        created_at: new Date().toISOString(),
      };
      setOpportunities((prev) => [opp, ...prev]);
      return opp;
    },
    [auth.user]
  );

  const applyToOpportunity = useCallback(
    (opportunityId: string, message: string) => {
      if (!auth.user) return null;
      if (auth.user.completeness < 60) return null;
      const existing = applications.find(
        (a) => a.opportunity_id === opportunityId && a.applicant_id === auth.user!.id
      );
      if (existing) return existing;

      const opportunity = opportunities.find((o) => o.id === opportunityId);
      const app: Application = {
        id: `app-${Date.now()}`,
        opportunity_id: opportunityId,
        opportunity,
        applicant_id: auth.user.id,
        applicant: auth.user,
        message,
        status: "sent",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setApplications((prev) => [app, ...prev]);
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? { ...o, applications_count: o.applications_count + 1 }
            : o
        )
      );
      track("first_application", { opportunityId });
      awardSignal("apply");
      if (opportunity?.author_id) {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            user_id: opportunity.author_id,
            type: "application",
            title: "Nouvelle candidature",
            body: `${auth.user!.full_name} a candidaté à « ${opportunity.title} ».`,
            link: `/opportunities/${opportunityId}`,
            read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: `notif-mail-${Date.now()}`,
            user_id: opportunity.author_id,
            type: "system",
            title: "E-mail simulé",
            body: `[Email] Nouvelle candidature de ${auth.user!.full_name} — ${opportunity.title}`,
            link: `/opportunities/${opportunityId}`,
            read: false,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      return app;
    },
    [auth.user, applications, opportunities, awardSignal]
  );

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: ApplicationStatus) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status, updated_at: new Date().toISOString() }
            : a
        )
      );
      const app = applications.find((a) => a.id === applicationId);
      if (app) {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            user_id: app.applicant_id,
            type: "status",
            title: "Statut de candidature",
            body: `Votre candidature est maintenant : ${status}`,
            link: `/opportunities/${app.opportunity_id}`,
            read: false,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    },
    [applications]
  );

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (!auth.user) return;
      const msg: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: auth.user.id,
        sender: auth.user,
        content,
        type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, last_message: msg, updated_at: msg.created_at }
            : c
        )
      );
      track("first_message");
      const conv = conversations.find((c) => c.id === conversationId);
      const otherId = conv?.participant_ids.find((id) => id !== auth.user!.id);
      if (otherId) {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            user_id: otherId,
            type: "message",
            title: "Nouveau message",
            body: `${auth.user!.full_name}: ${content.slice(0, 80)}`,
            link: `/messages/${conversationId}`,
            read: false,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    },
    [auth.user, conversations]
  );

  const requestVerification = useCallback(() => {
    if (!auth.user) return;
    const user = auth.user;
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        user_id: "user-admin-1",
        type: "system",
        title: "Demande de vérification",
        body: `${user.full_name} (@${user.handle}) demande une vérification d'identité.`,
        link: "/admin",
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: `notif-self-${Date.now()}`,
        user_id: user.id,
        type: "system",
        title: "Demande envoyée",
        body: "Votre demande de vérification a été transmise à l'équipe PLAYCE.",
        link: "/profile",
        read: false,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [auth.user]);

  const startConversation = useCallback(
    (otherUserId: string, initialMessage?: string) => {
      if (!auth.user) return "";
      const existing = conversations.find(
        (c) =>
          c.participant_ids.includes(auth.user!.id) &&
          c.participant_ids.includes(otherUserId)
      );
      if (existing) {
        if (initialMessage) sendMessage(existing.id, initialMessage);
        return existing.id;
      }
      const other = profiles.find((p) => p.id === otherUserId);
      const id = `conv-${Date.now()}`;
      const conv: Conversation = {
        id,
        participant_ids: [auth.user.id, otherUserId],
        participants: [auth.user, other!].filter(Boolean),
        updated_at: new Date().toISOString(),
        unread_count: 0,
      };
      setConversations((prev) => [conv, ...prev]);
      if (initialMessage) {
        setTimeout(() => sendMessage(id, initialMessage), 0);
      }
      return id;
    },
    [auth.user, conversations, profiles, sendMessage]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) =>
        auth.user && n.user_id === auth.user.id ? { ...n, read: true } : n
      )
    );
  }, [auth.user]);

  const createReport = useCallback(
    (data: Omit<Report, "id" | "reporter_id" | "status" | "created_at">) => {
      if (!auth.user) return;
      setReports((prev) => [
        {
          ...data,
          id: `rep-${Date.now()}`,
          reporter_id: auth.user!.id,
          status: "pending",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [auth.user]
  );

  const followUser = useCallback((_userId: string) => {
    // Demo: no-op visual for now
  }, []);

  const suspendUser = useCallback((userId: string, suspend: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, is_suspended: suspend } : p))
    );
  }, []);

  const verifyUser = useCallback((userId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, identity_verified: true } : p))
    );
  }, []);

  const resolveReport = useCallback(
    (reportId: string, status: "resolved" | "dismissed") => {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    },
    []
  );

  const value = useMemo<DemoStore>(
    () => ({
      auth,
      profiles,
      posts,
      comments,
      opportunities,
      applications,
      conversations,
      messages,
      notifications,
      reports,
      experiences,
      sports,
      signal,
      lastSignalGain,
      loginAs,
      logout,
      register,
      updateProfile,
      completeOnboarding,
      createPost,
      toggleLike,
      addComment,
      createOpportunity,
      applyToOpportunity,
      updateApplicationStatus,
      sendMessage,
      startConversation,
      markNotificationRead,
      markAllNotificationsRead,
      createReport,
      followUser,
      suspendUser,
      verifyUser,
      resolveReport,
      getMatchScore,
      requestVerification,
      awardSignal,
      clearSignalGain,
    }),
    [
      auth,
      profiles,
      posts,
      comments,
      opportunities,
      applications,
      conversations,
      messages,
      notifications,
      reports,
      experiences,
      signal,
      lastSignalGain,
      loginAs,
      logout,
      register,
      updateProfile,
      completeOnboarding,
      createPost,
      toggleLike,
      addComment,
      createOpportunity,
      applyToOpportunity,
      updateApplicationStatus,
      sendMessage,
      startConversation,
      markNotificationRead,
      markAllNotificationsRead,
      createReport,
      followUser,
      suspendUser,
      verifyUser,
      resolveReport,
      getMatchScore,
      requestVerification,
      awardSignal,
      clearSignalGain,
    ]
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-playce-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-playce-teal border-t-transparent" />
      </div>
    );
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
