const ROUTES = {
   HOME: "/",
   SIGN_IN: "/sign-in",
   SIGN_UP: "/sign-up",
   COMUNITY: "/community",
   COLLECTION: "/collection",
   JOBS: "/jobs",
   TAGS: (id: string) => `/tags/${id}`,
   PROFILE: (id: string) => `/profile/${id}`,
   QUESTION: (id: string) => `/questions/${id}`,
   ASK_QUESTION: "/ask-question",
   SIGN_IN_WITH_OAUTH: "signin-with-oauth",
};

export default ROUTES;
