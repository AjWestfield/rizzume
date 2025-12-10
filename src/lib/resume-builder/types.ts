export interface ResumeSection<T> {
    id: string;
    title: string;
    items: T[];
}

export interface ExperienceItem {
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
}

export interface SkillItem {
    id: string;
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ResumeData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        linkedIn?: string;
        website?: string;
    };
    professionalTitle: string;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
}

export const initialResumeData: ResumeData = {
    personalInfo: {
        fullName: "Steve Jobs",
        email: "steve@apple.com",
        phone: "",
        location: "Los Altos, CA",
        linkedIn: "linkedin.com/stevejobs",
    },
    professionalTitle: "Co-Founder, Chairman & CEO",
    summary: "Visionary leader and entrepreneur who revolutionized personal computing, mobile phones, and digital entertainment.",
    experience: [
        {
            id: "1",
            company: "Apple Inc.",
            position: "Co-Founder, Chairman & CEO",
            location: "Cupertino, CA",
            startDate: "1997",
            endDate: "2011",
            current: false,
            description: "Led Apple's transformation into the world's most valuable company.",
        },
        {
            id: "2",
            company: "NeXT Inc.",
            position: "Founder & CEO",
            location: "Redwood City, CA",
            startDate: "1985",
            endDate: "1996",
            current: false,
            description: "Founded NeXT Computer, developing advanced workstations.",
        },
        {
            id: "3",
            company: "Pixar",
            position: "Chairman & CEO",
            location: "Emeryville, CA",
            startDate: "1986",
            endDate: "2006",
            current: false,
            description: "Transformed Pixar into the world's leading animation studio, creating groundbreaking films.",
        },
    ],
    education: [
        {
            id: "1",
            institution: "Reed College",
            degree: "Liberal Arts",
            field: "",
            location: "Portland, OR",
            startDate: "1972",
            endDate: "1974",
            current: false,
        },
    ],
    skills: [
        { id: "1", name: "Leadership", level: "Expert" },
        { id: "2", name: "Product Design", level: "Expert" },
        { id: "3", name: "Marketing", level: "Expert" },
        { id: "4", name: "Strategy", level: "Expert" },
    ],
};
