/**
 * Seed: 10 casas en la zona de Andratx (Mallorca) y 5 limpiadoras.
 * Para probar el flujo de cuadrante, propuesta óptima y rutas con datos realistas.
 *
 * Uso:
 *   cd functions
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json node migrations/seedAndratxMallorca.js
 *
 * Opcional: companyId por argumento (si no, se usa el de admin@admin.es)
 *   node migrations/seedAndratxMallorca.js <companyId>
 */

const admin = require("firebase-admin");

const ADMIN_EMAIL = "admin@admin.es";

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccount) {
  console.error(
    "Set GOOGLE_APPLICATION_CREDENTIALS to your service account key path.",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;

// Andratx, Mallorca: centro aprox. 39.575, 2.42. Pequeñas variaciones para 10 casas.
const ANDRATX_HOUSES = [
  {
    houseName: "Villa Sallent",
    address: "Carrer Sallent 12, 07150 Andratx",
    latitude: 39.572,
    longitude: 2.418,
  },
  {
    houseName: "Casa les Escoles",
    address: "Carrer de les Escoles 5, 07150 Andratx",
    latitude: 39.574,
    longitude: 2.421,
  },
  {
    houseName: "Villa Clavell",
    address: "Carrer Clavell 8, 07150 Andratx",
    latitude: 39.576,
    longitude: 2.419,
  },
  {
    houseName: "Casa Puerto Andratx",
    address: "Port d'Andratx, 07157",
    latitude: 39.541,
    longitude: 2.389,
  },
  {
    houseName: "Villa Camp de Mar",
    address: "Carretera de Camp de Mar 3, 07160",
    latitude: 39.531,
    longitude: 2.398,
  },
  {
    houseName: "Casa Archiduque",
    address: "Carrer Archiduque 15, 07150 Andratx",
    latitude: 39.578,
    longitude: 2.423,
  },
  {
    houseName: "Villa San Telmo",
    address: "Av. Jaume I 7, 07159 S'Arracó",
    latitude: 39.565,
    longitude: 2.408,
  },
  {
    houseName: "Casa Pedro Ferrer",
    address: "Carrer Pedro Ferrer 22, 07150 Andratx",
    latitude: 39.573,
    longitude: 2.417,
  },
  {
    houseName: "Villa Cúria",
    address: "Av. de la Cúria 4, 07150 Andratx",
    latitude: 39.575,
    longitude: 2.42,
  },
  {
    houseName: "Casa Mallorca",
    address: "Carrer Mallorca 9, 07150 Andratx",
    latitude: 39.577,
    longitude: 2.422,
  },
];

// Limpiadoras: domicilio en Palma o Calvià (para punto de partida al optimizar ruta)
const LIMPIADORAS = [
  {
    firstName: "María",
    lastName: "García",
    homeAddress: "Carrer de la Unió 8, 07001 Palma",
    latitude: 39.571,
    longitude: 2.648,
  },
  {
    firstName: "Carmen",
    lastName: "López",
    homeAddress: "Carrer de Sant Feliu 14, 07001 Palma",
    latitude: 39.573,
    longitude: 2.652,
  },
  {
    firstName: "Isabel",
    lastName: "Martínez",
    homeAddress: "Av. Joan Miró 45, 07015 Palma",
    latitude: 39.568,
    longitude: 2.638,
  },
  {
    firstName: "Rosa",
    lastName: "Sánchez",
    homeAddress: "Carrer de Calvià 3, 07184 Calvià",
    latitude: 39.565,
    longitude: 2.508,
  },
  {
    firstName: "Ana",
    lastName: "Fernández",
    homeAddress: "Carrer de Peguera 22, 07160 Calvià",
    latitude: 39.538,
    longitude: 2.451,
  },
];

async function getCompanyId() {
  let companyId = process.argv[2];
  if (companyId) {
    const companyDoc = await db.collection("companies").doc(companyId).get();
    if (!companyDoc.exists) {
      console.error(`Company "${companyId}" no existe en Firestore.`);
      process.exit(1);
    }
    console.log("Usando companyId:", companyId);
    return companyId;
  }
  try {
    const user = await auth.getUserByEmail(ADMIN_EMAIL);
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      console.error(
        `Usuario ${ADMIN_EMAIL} existe en Auth pero no hay doc en users.`,
      );
      process.exit(1);
    }
    companyId = userDoc.data().companyId;
    if (!companyId) {
      console.error(
        `Usuario ${ADMIN_EMAIL} no tiene companyId. Ejecuta registerCompany antes.`,
      );
      process.exit(1);
    }
    console.log("Usando companyId de", ADMIN_EMAIL, ":", companyId);
    return companyId;
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      console.error(
        `No existe usuario ${ADMIN_EMAIL}. Pasa companyId: node seedAndratxMallorca.js <companyId>`,
      );
    } else {
      console.error("Error obteniendo admin:", e.message);
    }
    process.exit(1);
  }
}

async function seedHousesAndratx(companyId) {
  const col = db.collection("properties");
  const existing = await col.where("companyId", "==", companyId).get();
  const byName = new Set(existing.docs.map((d) => d.data().houseName));

  const created = [];
  for (const h of ANDRATX_HOUSES) {
    if (byName.has(h.houseName)) {
      console.log("  Ya existe:", h.houseName);
      continue;
    }
    const ref = await col.add({
      companyId,
      houseName: h.houseName,
      address: h.address,
      location: {
        latitude: h.latitude,
        longitude: h.longitude,
      },
      createdAt: FieldValue.serverTimestamp(),
    });
    created.push({ id: ref.id, ...h });
  }
  if (created.length) {
    console.log(
      "Creadas",
      created.length,
      "casas en Andratx:",
      created.map((c) => c.houseName).join(", "),
    );
  } else {
    console.log(
      "No se añadieron casas nuevas (ya existían las 10 de Andratx).",
    );
  }
  return created;
}

async function seedLimpiadoras(companyId) {
  const col = db.collection("users");
  const existingByEmail = new Map();
  const existing = await col
    .where("companyId", "==", companyId)
    .where("role", "==", "worker")
    .get();
  existing.docs.forEach((d) => {
    const data = d.data();
    if (data.email) existingByEmail.set(data.email, { id: d.id, ...data });
  });

  const created = [];
  const updated = [];
  const prefix = `limpiadora-andratx-${companyId.slice(0, 6)}`;
  for (let i = 0; i < LIMPIADORAS.length; i++) {
    const w = LIMPIADORAS[i];
    const email = `${prefix}-${i + 1}@demo.local`;
    const payload = {
      homeAddress: w.homeAddress || null,
      homeLocation:
        w.latitude != null && w.longitude != null
          ? { latitude: w.latitude, longitude: w.longitude }
          : null,
    };
    const existingWorker = existingByEmail.get(email);
    if (existingWorker) {
      if (!existingWorker.homeLocation && payload.homeLocation) {
        await col.doc(existingWorker.id).update(payload);
        updated.push(`${w.firstName} ${w.lastName} (domicilio Palma/Calvià)`);
      }
      continue;
    }
    const uid = `${prefix}-${i + 1}`;
    await col.doc(uid).set({
      companyId,
      firstName: w.firstName,
      lastName: w.lastName,
      role: "worker",
      email,
      homeAddress: w.homeAddress || null,
      homeLocation:
        w.latitude != null && w.longitude != null
          ? { latitude: w.latitude, longitude: w.longitude }
          : null,
      profileImage: { original: "", small: "" },
      createdAt: FieldValue.serverTimestamp(),
    });
    created.push({ id: uid, ...w, email });
  }
  if (created.length) {
    console.log(
      "Creadas",
      created.length,
      "limpiadoras (domicilio Palma/Calvià):",
      created.map((c) => `${c.firstName} ${c.lastName}`).join(", "),
    );
  }
  if (updated.length) {
    console.log("Actualizadas domicilio para:", updated.join(", "));
  }
  if (!created.length && !updated.length) {
    console.log("No se añadieron ni actualizaron limpiadoras.");
  }
  return created;
}

async function main() {
  const companyId = await getCompanyId();

  console.log("\n--- Casas en Andratx (Mallorca) ---");
  const houses = await seedHousesAndratx(companyId);

  console.log("\n--- Limpiadoras ---");
  const workers = await seedLimpiadoras(companyId);

  console.log("\nSeed Andratx completado.");
  console.log(
    "  Casas:",
    ANDRATX_HOUSES.length,
    "(10 en zona Andratx con dirección y coordenadas)",
  );
  console.log(
    "  Limpiadoras:",
    LIMPIADORAS.length,
    "(solo Firestore; sin Auth)",
  );
  console.log("\nEn el dashboard puedes:");
  console.log(
    "  - Ir a Cuadrante → Proponer combinación óptima (selecciona estas casas y limpiadoras)",
  );
  console.log(
    "  - Crear cuadrante y usar Optimizar ruta (las casas tienen coordenadas)",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
