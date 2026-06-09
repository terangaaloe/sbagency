import { Unavailable } from "@/components/sb/unavailable";

/* Rendu avec un statut HTTP 404 par Next pour tout appel à notFound() :
   tenant inexistant OU page désactivée → écran neutre, sans fuite d'infos. */
export default function NotFound() {
  return <Unavailable />;
}
