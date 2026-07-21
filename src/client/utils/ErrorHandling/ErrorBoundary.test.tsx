import { render, screen } from "@testing-library/react";
import React from "react";

import { DefaultErrorBoundary } from "./DefaultErrorBoundary";
import { ErrorBoundary } from "./ErrorBoundary";

function ThrowingComponent(): React.ReactElement {
  throw new Error("boom");
}

describe("Error boundaries", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders default fallback UI when child throws", () => {
    render(
      <DefaultErrorBoundary>
        <ThrowingComponent />
      </DefaultErrorBoundary>,
    );

    expect(screen.getByText(/Sorry, there is a problem with the service/i)).toBeInTheDocument();
  });

  it("renders custom fallback message when child throws", () => {
    render(
      <ErrorBoundary errorMessageText="Unable to load survey table correctly">
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Unable to load survey table correctly/i)).toBeInTheDocument();
  });
});
