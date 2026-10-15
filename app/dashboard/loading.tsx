import LoadingSkeleton from "../components/loading-skeleton";

export default function Loading() {
  return <LoadingSkeleton title="Preparing dashboard..." layout="dashboard" fullScreen={false} />;
}
