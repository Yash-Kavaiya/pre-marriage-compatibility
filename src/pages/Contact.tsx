import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SiteHeader from '@/components/SiteHeader';
import { useToast } from '@/hooks/use-toast';

const faqs = [
  {
    q: 'How accurate is the assessment?',
    a: 'It is built around the areas premarital counselors cover most often and measures how much weight each of you gives to each topic. It is a structured starting point for conversation, not a prediction of whether a marriage will succeed.',
  },
  {
    q: 'Where are our answers stored?',
    a: 'Nowhere on a server. Progress is saved only in your browser, and your answers travel inside the link you send your partner. Links are encoded rather than encrypted, so share them only with each other.',
  },
  {
    q: 'Can we retake it?',
    a: 'Yes. Many couples retake it after six months or after working with a counselor to see how their answers have moved.',
  },
  {
    q: 'Do you offer counseling?',
    a: 'We do not provide counseling directly, but we are happy to point you toward qualified premarital counselors who can help with the priority areas in your report.',
  },
];

const contactItems = [
  { icon: Mail, label: 'Email', value: 'support@marriagecompatibility.com' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
  { icon: MapPin, label: 'Office', value: '123 Relationship Street, Harmony City, HC 12345' },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: 'Message sent', description: 'Thank you for getting in touch. We will reply soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="paper min-h-screen">
      <SiteHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to assessment
            </Link>
          </Button>
        }
      />

      <main className="container max-w-5xl py-14 md:py-20">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-5xl font-semibold text-primary">We are here to help</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Questions about the assessment, your report, or finding a counselor? Send us a note.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="surface space-y-6 p-6 sm:p-8">
            {contactItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold">Hours</p>
              <p className="mt-1 text-muted-foreground">Monday to Friday, 9:00 to 18:00</p>
              <p className="text-muted-foreground">Saturday, 10:00 to 16:00</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="surface space-y-4 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send message'}
            </Button>
          </form>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-primary">Frequently asked questions</h2>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {faqs.map(({ q, a }) => (
              <div key={q} className="grid gap-2 py-6 md:grid-cols-[1fr_2fr] md:gap-8">
                <dt className="font-display text-xl font-semibold">{q}</dt>
                <dd className="leading-relaxed text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
};

export default Contact;
