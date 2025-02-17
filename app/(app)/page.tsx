import { Metadata } from "next";

const title = "Home";
const description = "Description";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <div className="container-wrapper">
        <div className="container py-6">
          <h1>Home Page</h1>
        </div>
      </div>
    </>
  );
}
