import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col ">
      <Link href="a/1" className="underline hover:text-accent">
        1.video link
      </Link>
      <Link className="underline hover:text-accent" href="a/2">
        2.audio link
      </Link>
      <Link className="underline hover:text-accent" href="a/3">
        3.img link
      </Link>
    </div>
  );
}
