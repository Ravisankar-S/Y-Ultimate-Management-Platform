import React from "react";
import MediaUpload from "./MediaUpload.jsx";
import TournamentGallery from "./TournamentGallery.jsx";

export default function MediaManagement({ tournamentId }) {
    return (
        <div className="space-y-6">
            <MediaUpload tournamentId={tournamentId} />
            <TournamentGallery tournamentId={tournamentId} />
        </div>
    );
}
