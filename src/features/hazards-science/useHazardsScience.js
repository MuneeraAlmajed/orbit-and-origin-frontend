import { useEffect, useMemo, useState } from "react";
import {
  getHazardById,
  getNearbyHazards,
  getSciencePois,
  getSciencePoiById,
  getNearbySciencePois,
  getHazards,
} from "./hazardsScienceApi";

export function useHazardsScience() {
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [importance, setImportance] = useState("all");
  const [search, setSearch] = useState("");

  const [hazards, setHazards] = useState([]);
  const [sciencePois, setSciencePois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [nearbyResults, setNearbyResults] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadLocations() {
      setLoading(true);
      setError("");

      try {
        const [hazardResponse, scienceResponse] = await Promise.all([
          getHazards({}, controller.signal),
          getSciencePois(
            importance === "all" ? {} : { importance },
            controller.signal,
          ),
        ]);

        if (controller.signal.aborted) return;

        setHazards(
          (hazardResponse.hazards ?? []).filter(
            (hazard) => severity === "all" || hazard.severity === severity,
          ),
        );
        setSciencePois(scienceResponse.science_pois ?? []);
      } catch (err) {
        if (controller.signal.aborted) return;

        setHazards([]);
        setSciencePois([]);
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadLocations();

    return () => controller.abort();
  }, [severity, importance]);

  useEffect(() => {
    if (!selected) return;

    const controller = new AbortController();

    async function loadDetails() {
      try {
        const response =
          selected.kind === "hazard"
            ? await getHazardById(selected.id, controller.signal)
            : await getSciencePoiById(selected.id, controller.signal);

        if (controller.signal.aborted) return;

        setDetails(response);
      } catch (err) {
        if (!controller.signal.aborted) {
          setDetailsError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    }

    loadDetails();

    return () => controller.abort();
  }, [selected]);

  const visibleLocations = useMemo(() => {
    const locations = [
      ...hazards.map((hazard) => ({
        ...hazard,
        kind: "hazard",
      })),
      ...sciencePois.map((poi) => ({
        ...poi,
        kind: "science",
      })),
    ];

    const term = search.trim().toLowerCase();

    return locations.filter((location) => {
      if (category === "hazards" && location.kind !== "hazard") {
        return false;
      }

      if (category === "science" && location.kind !== "science") {
        return false;
      }

      if (term) {
        const text = [location.name, location.type, location.description]
          .join(" ")
          .toLowerCase();

        if (!text.includes(term)) return false;
      }

      if (nearbyResults) {
        const matched = nearbyResults[location.kind];

        if (!matched.has(location.id)) {
          return false;
        }
      }

      return true;
    });
  }, [hazards, sciencePois, category, search, nearbyResults]);

  function selectLocation(location) {
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);

    setSelected({
      id: location.id,
      kind: location.kind,
    });
  }

  async function findNearby(lat, lon, radius) {
    const values = [lat, lon, radius];

    if (values.some((value) => String(value).trim() === "")) {
      setNearbyError("All coordinate fields are required.");
      return;
    }

    const latitude = Number(lat);
    const longitude = Number(lon);
    const distance = Number(radius);

    if (
      ![latitude, longitude, distance].every(Number.isFinite) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180 ||
      distance <= 0
    ) {
      setNearbyError("Enter valid coordinates and a positive radius.");
      return;
    }

    setNearbyLoading(true);
    setNearbyError("");

    try {
      const [hazardResponse, scienceResponse] = await Promise.all([
        getNearbyHazards(latitude, longitude, distance),
        getNearbySciencePois(latitude, longitude, distance),
      ]);

      setNearbyResults({
        hazard: new Map(
          hazardResponse.hazards.map((item) => [item.id, item.distance_km]),
        ),
        science: new Map(
          scienceResponse.science_pois.map((item) => [
            item.id,
            item.distance_km,
          ]),
        ),
      });
    } catch (err) {
      setNearbyError(err.message);
      setNearbyResults(null);
    } finally {
      setNearbyLoading(false);
    }
  }

  function clearNearby() {
    setNearbyResults(null);
    setNearbyError("");
  }

  return {
    category,
    setCategory,
    severity,
    setSeverity,
    importance,
    setImportance,
    search,
    setSearch,
    hazards,
    sciencePois,
    visibleLocations,
    loading,
    error,
    selected,
    selectLocation,
    details,
    detailsLoading,
    detailsError,
    nearbyResults,
    nearbyLoading,
    nearbyError,
    findNearby,
    clearNearby,
  };
}
