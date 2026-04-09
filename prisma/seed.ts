import { prisma } from "@/database/prisma";
import { env } from "@/env";
import { hash } from "bcrypt";

async function seed() {
  await prisma.time.createMany({
    data: [
      { id: 1, time: "07:00", minutes: 420 },
      { id: 2, time: "08:00", minutes: 480 },
      { id: 3, time: "09:00", minutes: 540 },
      { id: 4, time: "10:00", minutes: 600 },
      { id: 5, time: "11:00", minutes: 660 },
      { id: 6, time: "12:00", minutes: 720 },
      { id: 7, time: "13:00", minutes: 780 },
      { id: 8, time: "14:00", minutes: 840 },
      { id: 9, time: "15:00", minutes: 900 },
      { id: 10, time: "16:00", minutes: 960 },
      { id: 11, time: "17:00", minutes: 1020 },
      { id: 12, time: "18:00", minutes: 1080 },
      { id: 13, time: "19:00", minutes: 1140 },
      { id: 14, time: "20:00", minutes: 1200 },
      { id: 15, time: "21:00", minutes: 1260 },
      { id: 16, time: "22:00", minutes: 1320 },
      { id: 17, time: "23:00", minutes: 1380 },
    ],
  });

  const password = env.ADMIN_PASSWORD;
  const hashedPassword = await hash(password, 10);

  await prisma.user.create({
    data: {
      name: "Usuário Adm",
      email: "user.adm@email.com",
      password: hashedPassword,
      role: "admin",
      services: {
        createMany: {
          data: [
            {
              title: "Instalação e atualização de softwares",
              price: 120,
            },
            {
              title: "Instalação e atualização de hardwares",
              price: 140,
            },
            {
              title: "Diagnóstico e remoção de vírus",
              price: 150,
            },
            {
              title: "Suporte a impressoras",
              price: 70,
            },
            {
              title: "Suporte a periféricos",
              price: 70,
            },
            {
              title: "Solução de problemas de conectividade de internet",
              price: 100,
            },
            {
              title: "Backup e recuperação de dados",
              price: 200,
            },
            {
              title: "Otimização de desempenho do sistema operacional",
              price: 100,
            },
            {
              title: "Configuração de VPN e Acesso Remoto",
              price: 130,
            },
          ]
        }
      }
    },
  });

  await prisma.user.create({
    data: {
      name: "Rafael",
      email: "rafael@tech.com",
      password: await hash("#técnicorafael123", 10),
      role: "technician",
      technicianTimes: {
        createMany: {
          data: [
            { timeId: 2 },
            { timeId: 3 },
            { timeId: 4 },
            { timeId: 5 },
            { timeId: 6 },
            { timeId: 8 },
            { timeId: 9 },
            { timeId: 10 },
            { timeId: 11 },
            { timeId: 12 },
          ],
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: "Gabriel",
      email: "gabriel@tech.com",
      password: await hash("#técnicogabriel123", 10),
      role: "technician",
      technicianTimes: {
        createMany: {
          data: [
            { timeId: 4 },
            { timeId: 5 },
            { timeId: 6 },
            { timeId: 7 },
            { timeId: 8 },
            { timeId: 10 },
            { timeId: 11 },
            { timeId: 12 },
            { timeId: 13 },
            { timeId: 14 },
          ],
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: "José",
      email: "jose@tech.com",
      password: await hash("#técnicojose123", 10),
      role: "technician",
      technicianTimes: {
        createMany: {
          data: [
            { timeId: 6 },
            { timeId: 7 },
            { timeId: 8 },
            { timeId: 9 },
            { timeId: 10 },
            { timeId: 12 },
            { timeId: 13 },
            { timeId: 14 },
            { timeId: 15 },
            { timeId: 16 },
          ],
        },
      },
    },
  });
}

seed().then(() => {
  console.log("Db seeded!");
  prisma.$disconnect();
});
