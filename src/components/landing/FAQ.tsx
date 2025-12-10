"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "What is Rizzume and how does it work?",
        answer: "Rizzume is an AI-powered resume builder and job application assistant. It uses advanced artificial intelligence to analyze your professional background and generate tailored resumes and cover letters for specific job descriptions. Simply upload your current resume, paste a job description, and let Rizzume handle the rest.",
    },
    {
        question: "How can Rizzume help me land a job faster?",
        answer: "Rizzume speeds up your job search by automating the most time-consuming parts: targeting your resume to pass ATS filters, writing compelling cover letters, and even auto-applying to jobs that match your preferences. Our users report getting 3x more interviews on average.",
    },
    {
        question: "What features does Rizzume offer?",
        answer: "Rizzume offers a comprehensive suite of tools including: AI Resume Builder, AI Cover Letter Generator, Auto Apply to Jobs, Resume Score & Analysis, Keyword Targeting, and Interview Preparation tools.",
    },
    {
        question: "Do I need an existing resume to use Rizzume?",
        answer: "No! While you can upload an existing resume to get started faster, you can also build one from scratch using our guided AI resume builder.",
    },
    {
        question: "Will my Rizzume resume be ATS-friendly?",
        answer: "Absolutely. All Rizzume templates are designed to be 100% ATS (Applicant Tracking System) friendly, ensuring your resume gets read by both robots and recruiters.",
    },
    {
        question: "Does using AI mean my resume and cover letters will sound generic?",
        answer: "Not at all. Rizzume uses your specific experience and achievements to generate unique content. You can also customize the tone and style to match your personal brand.",
    },
    {
        question: "Can employers tell if I used AI to write my application?",
        answer: "Rizzume is designed to produce natural, professional-sounding text that is indistinguishable from human-written content. We prioritize quality and authenticity.",
    },
    {
        question: "Is Rizzume free to use? Do you offer a free trial?",
        answer: "Yes, Rizzume offers a free plan that lets you build a resume and try out our core features. We also offer premium plans for unlimited AI generations and auto-apply features.",
    },
    {
        question: "What subscription plans and pricing does Rizzume offer?",
        answer: "We offer flexible monthly and annual plans to suit your needs. Check our pricing section for the latest details on our Pro and Elite tiers.",
    },
    {
        question: "Can Rizzume generate cover letters for me?",
        answer: "Yes! Rizzume can generate a highly personalized cover letter for any job description in seconds, highlighting why you are the perfect fit for the role.",
    },
    {
        question: "Does Rizzume offer interview preparation tools?",
        answer: "Yes, our Interview Buddy feature helps you practice for interviews with AI-generated questions based on the specific job you applied for.",
    },
    {
        question: "Can Rizzume really apply to jobs on my behalf?",
        answer: "Yes, our Auto Apply feature can automatically submit applications to jobs that match your criteria on major job boards, saving you hundreds of hours.",
    },
    {
        question: "Who is Rizzume for?",
        answer: "Rizzume is for anyone looking to advance their career, from students and new grads to experienced professionals and executives across all industries.",
    },
    {
        question: "How is Rizzume different from other resume builders?",
        answer: "Unlike basic template builders, Rizzume actively writes content for you, optimizes for specific job descriptions, and automates the application process, giving you a true competitive edge.",
    },
    {
        question: "Is my data safe and private with Rizzume?",
        answer: "Yes, your data security and privacy are our top priorities. We use industry-standard encryption and do not share your personal information with third parties without your consent.",
    },
];

export function FAQ() {
    return (
        <section id="faq" className="py-24 bg-white">
            <div className="container max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                        Frequently Asked Questions
                    </h2>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="bg-gray-50 px-6 rounded-2xl border-none data-[state=open]:bg-gray-100">
                            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
