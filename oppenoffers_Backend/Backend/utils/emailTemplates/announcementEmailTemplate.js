/**
 * Template HTML pour l'email de notification de nouvelle annonce
 * @param {Object} announcementData - Données de l'annonce
 * @returns {string} HTML formaté de l'email
 */
const generateAnnouncementEmailHTML = (announcementData) => {
  // Format dates for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Non spécifiée';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:mm format
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header { 
          background-color: #4CAF50; 
          color: white; 
          padding: 20px; 
          text-align: center; 
          border-radius: 5px 5px 0 0;
        }
        .header h2 {
          margin: 0;
          font-size: 24px;
        }
        .content { 
          padding: 20px; 
          background-color: #f9f9f9; 
        }
        .info-row { 
          margin: 10px 0; 
          padding: 15px; 
          background-color: white; 
          border-left: 4px solid #4CAF50;
          border-radius: 3px;
        }
        .label { 
          font-weight: bold; 
          color: #555; 
          display: inline-block;
          min-width: 150px;
        }
        .value {
          color: #333;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #777; 
          font-size: 12px; 
          background-color: #f9f9f9;
          border-radius: 0 0 5px 5px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            padding: 10px !important;
          }
          .label {
            display: block;
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Annonce Validée et Publiée</h2>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Une annonce a été validée et publiée. Voici les détails :</p>
          
          <div class="info-row">
            <span class="label">Numéro d'annonce :</span>
            <span class="value">${announcementData.Numero || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Journal :</span>
            <span class="value">${announcementData.Journal || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Date de publication :</span>
            <span class="value">${formatDate(announcementData.Date_Publication)}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Date d'ouverture :</span>
            <span class="value">${formatDate(announcementData.Date_Overture)}</span>
          </div>
          
          ${announcementData.Heure_Ouverture ? `
          <div class="info-row">
            <span class="label">Heure d'ouverture :</span>
            <span class="value">${formatTime(announcementData.Heure_Ouverture)}</span>
          </div>
          ` : ''}
          
          ${announcementData.Delai ? `
          <div class="info-row">
            <span class="label">Délai (jours) :</span>
            <span class="value">${announcementData.Delai}</span>
          </div>
          ` : ''}
          
          <p style="margin-top: 20px;">Cordialement,<br>L'équipe d'administration</p>
        </div>
        <div class="footer">
          <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generateAnnouncementEmailHTML
};

