const admin = require("firebase-admin");

const DEFAULT_CHECKS = [
  {
    nameEs: "Limpieza general",
    nameEn: "General cleaning",
    icon: "cleaning-services",
    category: "Limpieza",
  },
  {
    nameEs: "Cocina",
    nameEn: "Kitchen",
    icon: "countertops",
    category: "Limpieza",
  },
  {
    nameEs: "Baños",
    nameEn: "Bathrooms",
    icon: "bathtub",
    category: "Limpieza",
  },
  {
    nameEs: "Dormitorios",
    nameEn: "Bedrooms",
    icon: "bed",
    category: "Limpieza",
  },
  { nameEs: "Terraza", nameEn: "Terrace", icon: "deck", category: "Exterior" },
  { nameEs: "Jardín", nameEn: "Garden", icon: "grass", category: "Exterior" },
  { nameEs: "Piscina", nameEn: "Pool", icon: "pool", category: "Exterior" },
  { nameEs: "Garaje", nameEn: "Garage", icon: "garage", category: "Exterior" },
  {
    nameEs: "Ventanas",
    nameEn: "Windows",
    icon: "window",
    category: "Limpieza",
  },
  {
    nameEs: "Aire acondicionado",
    nameEn: "Air conditioning",
    icon: "ac-unit",
    category: "Mantenimiento",
  },
];

const DEFAULT_TASKS = [
  {
    nameEs: "Limpieza",
    nameEn: "Cleaning",
    icon: "cleaning-services",
    description: "",
  },
  {
    nameEs: "Mantenimiento",
    nameEn: "Maintenance",
    icon: "build",
    description: "",
  },
  { nameEs: "Jardinería", nameEn: "Gardening", icon: "grass", description: "" },
  { nameEs: "Piscina", nameEn: "Pool", icon: "pool", description: "" },
  {
    nameEs: "Pintura",
    nameEn: "Painting",
    icon: "format-paint",
    description: "",
  },
  {
    nameEs: "Fontanería",
    nameEn: "Plumbing",
    icon: "plumbing",
    description: "",
  },
  {
    nameEs: "Electricidad",
    nameEn: "Electrical",
    icon: "electrical-services",
    description: "",
  },
];

/**
 * Seeds the default checks and tasks catalog for a newly created company.
 * Called from registerCompany after company creation.
 */
async function seedDefaultCatalog(companyId) {
  const db = admin.firestore();
  const batch = db.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const check of DEFAULT_CHECKS) {
    const ref = db.collection("checkTemplates").doc();
    batch.set(ref, {
      ...check,
      name: check.nameEs,
      companyId,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const task of DEFAULT_TASKS) {
    const ref = db.collection("tasks").doc();
    batch.set(ref, {
      ...task,
      name: task.nameEs,
      companyId,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`Seeded default catalog for company ${companyId}`);
}

module.exports = { seedDefaultCatalog };
