"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="shell page-pad">
      <p className="kicker">Unavailable</p>
      <h1 className="page-title">The collective could not be reached.</h1>
      <button className="btn btn-solid" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
