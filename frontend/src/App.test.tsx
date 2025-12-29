import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Todos title", () => {
  render(<App />);
  expect(screen.getByText("Todos")).toBeInTheDocument();
});