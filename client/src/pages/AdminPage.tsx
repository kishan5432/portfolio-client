import { Helmet } from 'react-helmet-async';

export default function AdminPage() {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Portfolio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Admin functionality will be implemented here.
          </p>
        </div>
      </main>
    </>
  );
}

