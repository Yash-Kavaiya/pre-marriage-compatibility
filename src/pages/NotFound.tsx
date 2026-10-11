import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="paper flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 text-5xl font-semibold text-primary">This page could not be found</h1>
        <p className="mt-3 text-muted-foreground">The link may be incomplete. If a partner sent it, ask them to copy it again.</p>
        <Button asChild className="mt-8">
          <Link to="/">Return home</Link>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;
