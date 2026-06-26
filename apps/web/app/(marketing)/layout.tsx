import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { CustomCursor } from "@/components/custom-cursor";
import { PageLoader } from "@/components/page-loader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageLoader />
      <div className="grain" aria-hidden="true" />
      <CustomCursor />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
