import { api } from "../../convex/_generated/api";

import { useQuery } from "convex/react";

type QueryType = "dashboard" | "articles" | "users";

function useBatchedQueries(type: QueryType = "dashboard") {
  switch (type) {
    case "dashboard":
      const articles = useQuery(api.articles.list, { limit: 10 });
      const stats = useQuery(api.admin.getStats);
      return {
        isLoading: !articles || !stats,
        data: { articles, stats }
      };
    
    case "articles":
      const allArticles = useQuery(api.articles.list, { limit: 10 });
      const tags = useQuery(api.tags.list, { limit: 10 });
      return {
        isLoading: !allArticles || !tags,
        data: { articles: allArticles, tags }
      };
    
    // Add more cases as needed
    default:
      return {
        isLoading: false,
        data: {}
      };
  }
}

export default useBatchedQueries;