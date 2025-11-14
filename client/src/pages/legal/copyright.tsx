
import Footer from "@/components/layout/footer";

export default function Copyright() {
  return (
    <>
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Copyright Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Content Ownership</h2>
            <p className="text-muted-foreground leading-relaxed">All stories and creative works posted on our platform remain the intellectual property of their respective authors. By submitting content, you affirm that you are the original creator or have the necessary rights to share the work.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Content Usage</h2>
            <p className="text-muted-foreground leading-relaxed">Users may not copy, reproduce, distribute, or create derivative works from any content posted on this platform without explicit permission from the copyright holder.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Copyright Claims</h2>
            <p className="text-muted-foreground leading-relaxed">If you believe your copyrighted work has been improperly used on our platform, please contact our copyright team with:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>A description of the copyrighted work</li>
              <li>The location of the unauthorized content</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief</li>
              <li>A statement of accuracy under penalty of perjury</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
