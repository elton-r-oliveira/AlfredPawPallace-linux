import { API_URL } from '../lib/api';

export const getPetSource = (animalType: string, photoUrl?: string | null) => {
  if (photoUrl) return { uri: `${API_URL}${photoUrl}` };
  return getPetImage(animalType);
};

export const getPetImage = (type: string) => {
    switch (type.toLowerCase()) {
        case "dog":
            return require("../assets/pets/dog.png");
        case "cat":
            return require("../assets/pets/cat.png");
        case "roedores":
            return require("../assets/pets/hamster.png");
        case "turtle":
            return require("../assets/pets/turtle.png");
        case "bird":
            return require("../assets/pets/bird.png");
        case "rabbit":
            return require("../assets/pets/rabbit.png");
        default:
            return require("../assets/pets/pet.png");
    }
};

export const getTypeLabel = (type: 'vaccine' | 'dewormer' | 'antiparasitic') => {
    switch (type) {
        case 'vaccine': return 'Vacina';
        case 'dewormer': return 'Vermífugo';
        case 'antiparasitic': return 'Antiparasitário';
        default: return 'Registro';
    }
};

export const formatDate = (dateString: string) => {
    if (!dateString) return "";

    // Se vier no formato AAAA-MM-DD, tratar manualmente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split("-").map(Number);
        return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
    }

    // Caso venha Timestamp ou ISO completo, cai no default
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
};