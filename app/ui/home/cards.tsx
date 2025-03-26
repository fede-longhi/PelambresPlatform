import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

export function HomeCard (props : {
    imageName: string,
    imagePosition: 'left' | 'right',
    title: string,
    description: string,
    titleLink?: string,
}) {
    return (
        <div className={`${clsx(props.imagePosition == 'right' ? 'flex-row-reverse' : 'flex-row')} flex items-center md:mx-12 justify-start bg-slate-100 rounded-xl max-h-[256px]`}>
            
            <Image
                className={`${clsx(
                    props.imagePosition == 'right' ? "rounded-r-xl" : "rounded-l-xl",
                )} bg-primary/40`}
                width={256}
                height={256}
                src={props.imageName}
                alt="Impresión 3D a demanda"
            />

            <div className="text-[18px] p-6 md:p-12">
                {
                    props.titleLink ?
                    <Link href={props.titleLink}>
                        <h2 className="text-[24px] font-semibold">{props.title}</h2>
                    </Link>
                    :
                    <h2 className="text-[24px] font-semibold">{props.title}</h2>
                }
                <p>{props.description}</p>
            </div>
        </div>
    )
}