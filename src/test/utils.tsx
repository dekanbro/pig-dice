import { render as testingLibraryRender } from "@testing-library/react";
import { ReactElement } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function customRender(ui: ReactElement) {
  return testingLibraryRender(
    <QueryClientProvider client={queryClient}>
      <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}>
        {ui}
      </PrivyProvider>
    </QueryClientProvider>
  );
}

export * from "@testing-library/react";
export { customRender as render }; 