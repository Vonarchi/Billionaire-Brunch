import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell page-pad">
      <p className="kicker">404</p>
      <h1 className="page-title">This page is not in the room.</h1>
      <Link className="btn btn-solid lift" href="/">
        Return home
      </Link>
    </div>
  );
}
