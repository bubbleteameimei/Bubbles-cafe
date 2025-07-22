import NewsletterForm from "./newsletter-form"

export default function NewsletterSubscription() {
  return (
    <div className="max-w-6xl py-10 px-4 sm:px-6 lg:px-8 lg:py-16 mx-auto bg-white dark:bg-black bg-opacity-90 dark:bg-opacity-80 backdrop-blur-sm rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="max-w-xl text-center mx-auto">
        <div className="mb-5">
          <h2 className="text-2xl font-bold md:text-3xl md:leading-tight dark:text-white">Sign up to our newsletter</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Get the latest updates, stories, and exclusive content directly to your inbox.
          </p>
        </div>

        <div className="mt-5 lg:mt-8">
          <NewsletterForm />
        </div>
        
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
          By subscribing, you agree to our privacy policy and consent to receive updates from our company.
        </p>
      </div>
    </div>
  )
}