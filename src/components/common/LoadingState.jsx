export default function LoadingState({ message = "Loading your inventory..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading</span>
      </div>
      <div className="text-body-secondary small">{message}</div>
    </div>
  );
}
