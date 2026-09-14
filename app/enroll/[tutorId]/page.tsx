import { getSession } from '@/actions/user.action';
import EnrollButton from '@/components/EnrollButton';
import { redirect } from 'next/navigation';



import { generateOSFAMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: { tutorId: string } }) {

    const { tutorId } = await params
    return generateOSFAMetadata({
        path: `/enroll/${tutorId}`,
        title: "Group Details & Enrollment | TQP System",
        description: "Review tutor availability, memorisation targets, and circle guidelines before confirming enrollment.",
    })

}


interface EnrollProps {
    params: Promise<{ tutorId: string }>;
}



export default async function EnrollDirect({ params }: EnrollProps) {
    const currentUser = await getSession();
    const { tutorId } = await params;

    if (!currentUser) {
        redirect(`/login?next=/enroll/${tutorId}`);
    }

    if (currentUser.role !== 'student') {
        redirect('/dashboard');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1>Confirm Enrollment</h1>
            <p>Are you sure you want to enroll with this tutor?</p>
            <EnrollButton tutorId={tutorId} />
        </div>
    );
}