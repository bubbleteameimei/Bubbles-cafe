import NewsletterForm from './newsletter/newsletter-form';

interface NewsletterSubscribeProps {
  className?: string;
  title?: string;
  description?: string;
}

export function NewsletterSubscribe({ 
  className = '',
  title = 'Stay Updated',
  description = 'Subscribe to our newsletter for the latest stories and updates.'
}: NewsletterSubscribeProps) {
  return (
    <div className={`newsletter-subscribe ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <NewsletterForm />
    </div>
  );
}

export default NewsletterSubscribe;