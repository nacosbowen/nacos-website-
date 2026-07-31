import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const departments = [
  { name: 'Computer Science', code: 'CSC' },
  { name: 'Software Engineering', code: 'SEN' },
  { name: 'Cyber Security', code: 'CYB' },
  { name: 'Information Technology', code: 'IFT' },
  { name: 'Management Information Systems', code: 'MIS' },
];

const roles = ['student', 'course_rep', 'executive', 'admin'] as const;

// BU19/BU20 = 500 level | BU21 = 400 | BU22 = 300 | BU23 = 200 | BU24 = 100
const students: { fullName: string; matricNumber: string; level: number }[] = [
  // ── Computer Science ───────────────────────────────────────────────
  { fullName: 'Ajibola Bello', matricNumber: 'BU19CIT1065', level: 500 },
  { fullName: 'Babatunde Reuben', matricNumber: 'BU20CIT1017', level: 500 },
  { fullName: 'Anjolaoluwa Oyedeji', matricNumber: 'BU21CSC1011', level: 400 },
  { fullName: 'Mofiyinfoluwa Adekanmbi', matricNumber: 'BU21CSC1068', level: 400 },
  { fullName: 'Stephen Olakunle', matricNumber: 'BU21CSC1071', level: 400 },
  { fullName: 'Adedolapo Atiba', matricNumber: 'BU22CSC1003', level: 300 },
  { fullName: 'Tiwanioluwa Adebayo-Adeyemi', matricNumber: 'BU22CSC1004', level: 300 },
  { fullName: 'Muhammed Mustapha', matricNumber: 'BU22CSC1005', level: 300 },
  { fullName: 'Olumide Ogundimu', matricNumber: 'BU22CSC1006', level: 300 },
  { fullName: 'Oluwaseyi Alonge', matricNumber: 'BU22CSC1007', level: 300 },
  { fullName: 'Oluwanifemi Obiyomi', matricNumber: 'BU22CSC1008', level: 300 },
  { fullName: 'Prosper Akinbiyi', matricNumber: 'BU22CSC1009', level: 300 },
  { fullName: 'David Osunmadewa', matricNumber: 'BU22CSC1010', level: 300 },
  { fullName: 'Oluwademilade Adenle', matricNumber: 'BU22CSC1011', level: 300 },
  { fullName: 'Ireoluwa Aluko', matricNumber: 'BU22CSC1012', level: 300 },
  { fullName: 'Elijah Oyelude', matricNumber: 'BU22CSC1013', level: 300 },
  { fullName: 'Abdul-Salam Adebayo', matricNumber: 'BU22CSC1014', level: 300 },
  { fullName: 'Emonena Otobo', matricNumber: 'BU22CSC1015', level: 300 },
  { fullName: 'Olukayode Sobande', matricNumber: 'BU22CSC1016', level: 300 },
  { fullName: 'Shalom Ajibola', matricNumber: 'BU22CSC1017', level: 300 },
  { fullName: 'Enoch Adesoye', matricNumber: 'BU22CSC1018', level: 300 },
  { fullName: 'Blessing Ajayi', matricNumber: 'BU22CSC1019', level: 300 },
  { fullName: 'Favour Ademola', matricNumber: 'BU22CSC1020', level: 300 },
  { fullName: 'Gbolahan Alade', matricNumber: 'BU22CSC1021', level: 300 },
  { fullName: 'Oghenetega Abiri', matricNumber: 'BU22CSC1022', level: 300 },
  { fullName: 'Marvellous Adedokun', matricNumber: 'BU22CSC1024', level: 300 },
  { fullName: 'Daniel Eze', matricNumber: 'BU22CSC1025', level: 300 },
  { fullName: 'Oluwatofunmi Awopeju', matricNumber: 'BU22CSC1027', level: 300 },
  { fullName: 'Oluwatomisin Awopeju', matricNumber: 'BU22CSC1029', level: 300 },
  { fullName: 'Mitchell Kester', matricNumber: 'BU22CSC1030', level: 300 },
  { fullName: 'Sarah Iyobosa', matricNumber: 'BU22CSC1031', level: 300 },
  { fullName: 'Kolafunmi Ibironke', matricNumber: 'BU22CSC1032', level: 300 },
  { fullName: 'Divine Uche', matricNumber: 'BU22CSC1033', level: 300 },
  { fullName: 'Obaloluwa Ojo', matricNumber: 'BU22CSC1034', level: 300 },
  { fullName: 'Oluwatobi Ayodele', matricNumber: 'BU22CSC1035', level: 300 },
  { fullName: 'Oladapo Olukowajo', matricNumber: 'BU22CSC1036', level: 300 },
  { fullName: 'Princess Adelekan-Jenfa', matricNumber: 'BU22CSC1037', level: 300 },
  { fullName: 'Oluwatobiloba Olakanmi', matricNumber: 'BU22CSC1038', level: 300 },
  { fullName: 'Basit Afolayan', matricNumber: 'BU22CSC1039', level: 300 },
  { fullName: 'Daniel Afolabi', matricNumber: 'BU22CSC1040', level: 300 },
  { fullName: 'Oladayo Oladele', matricNumber: 'BU22CSC1041', level: 300 },
  { fullName: 'Oluwole Oluwole', matricNumber: 'BU22CSC1043', level: 300 },
  { fullName: 'Karo Okoro', matricNumber: 'BU22CSC1044', level: 300 },
  { fullName: 'David Adibite-Daniel', matricNumber: 'BU22CSC1045', level: 300 },
  { fullName: 'Onyeka Agwunobi', matricNumber: 'BU22CSC1047', level: 300 },
  { fullName: 'Jeremiah Osayande', matricNumber: 'BU22CSC1049', level: 300 },
  { fullName: 'Ayomide Oluyemi', matricNumber: 'BU22CSC1050', level: 300 },
  { fullName: 'Rhoda Adigun', matricNumber: 'BU22CSC1051', level: 300 },
  { fullName: 'Oreoluwa Akinwale', matricNumber: 'BU22CSC1052', level: 300 },
  { fullName: 'Uyiri Atsiangbe', matricNumber: 'BU22CSC1053', level: 300 },
  { fullName: 'Daniel Jegede', matricNumber: 'BU22CSC1054', level: 300 },
  { fullName: 'Adeola Ojekunle', matricNumber: 'BU22CSC1055', level: 300 },
  { fullName: 'Paul Ajibade', matricNumber: 'BU22CSC1057', level: 300 },
  { fullName: 'Oluwasemilogo Adeniran', matricNumber: 'BU22CSC1059', level: 300 },
  { fullName: 'David Kalba', matricNumber: 'BU22CSC1060', level: 300 },
  { fullName: 'Tonbra-Pade Saniyo', matricNumber: 'BU22CSC1061', level: 300 },
  { fullName: 'Stephen Odunfa', matricNumber: 'BU22CSC1063', level: 300 },
  { fullName: 'Sultan Bayo-Lanlege', matricNumber: 'BU22CSC1064', level: 300 },
  { fullName: 'Oluwabusayo Agboola', matricNumber: 'BU22CSC1065', level: 300 },
  { fullName: 'Elijah Asuelimen', matricNumber: 'BU22CSC1066', level: 300 },
  { fullName: 'Oluyinka Shittu', matricNumber: 'BU22CSC1067', level: 300 },
  { fullName: 'Ayomide Akinbinu', matricNumber: 'BU22CSC1068', level: 300 },
  { fullName: 'Emmanuel Tope-Ademiluyi', matricNumber: 'BU22CSC1069', level: 300 },
  { fullName: 'Anthonia Alade', matricNumber: 'BU22CSC1070', level: 300 },
  { fullName: 'Bright Asuquo', matricNumber: 'BU22CSC1071', level: 300 },
  { fullName: 'Eniola Adeleye', matricNumber: 'BU22CSC1072', level: 300 },
  { fullName: 'Okiki Ope', matricNumber: 'BU22CSC1073', level: 300 },
  { fullName: 'Pascal Aderinola', matricNumber: 'BU22CSC1074', level: 300 },
  { fullName: 'Lydia Abraham', matricNumber: 'BU22CSC1075', level: 300 },
  { fullName: 'Joel Ohikhena', matricNumber: 'BU22CSC1076', level: 300 },
  { fullName: 'Peniel Okpala', matricNumber: 'BU22CSC1077', level: 300 },
  { fullName: 'Oyinbusola Adeyeye', matricNumber: 'BU22CSC1078', level: 300 },
  { fullName: 'David Ajao', matricNumber: 'BU22CSC1079', level: 300 },
  { fullName: 'Marvellous Omosebi', matricNumber: 'BU22CSC1080', level: 300 },
  { fullName: 'Adefolabi Adebisi', matricNumber: 'BU22CSC1081', level: 300 },
  { fullName: 'Matthew Ojo', matricNumber: 'BU22CSC1082', level: 300 },
  { fullName: 'Michael Gbadebo', matricNumber: 'BU22CSC1083', level: 300 },
  { fullName: 'Maxwell Magaji', matricNumber: 'BU22CSC1084', level: 300 },
  { fullName: 'Chukwunonso Okechukwu', matricNumber: 'BU22CSC1085', level: 300 },
  { fullName: 'Akorede Akindele', matricNumber: 'BU22CSC1086', level: 300 },
  { fullName: 'Olaniyi Ojedokun', matricNumber: 'BU22CSC1087', level: 300 },
  { fullName: 'Ogechi Ojugbeli', matricNumber: 'BU22CSC1088', level: 300 },
  { fullName: 'Muhammed Adebara', matricNumber: 'BU22CSC1089', level: 300 },
  { fullName: 'Praise Lucky', matricNumber: 'BU22CSC1090', level: 300 },
  { fullName: 'Ayodeji Ayodele-Olaniyi', matricNumber: 'BU22CSC1094', level: 300 },
  { fullName: 'Oluwasegun Oladapo', matricNumber: 'BU22CSC1095', level: 300 },
  { fullName: 'Ibukunoluwa Johnson', matricNumber: 'BU22CSC1096', level: 300 },
  { fullName: 'Samuel Adejayan', matricNumber: 'BU22CSC1098', level: 300 },
  { fullName: 'Olakunmi Bilau', matricNumber: 'BU22CSC1099', level: 300 },
  { fullName: 'Godsfavour Cole', matricNumber: 'BU22CSC1100', level: 300 },
  { fullName: 'Abdulmalik Ogundimu', matricNumber: 'BU22CSC1101', level: 300 },
  { fullName: 'Inumidun Abraham', matricNumber: 'BU22CSC1103', level: 300 },
  { fullName: 'Yusuf Ogundare', matricNumber: 'BU22CSC1104', level: 300 },
  { fullName: 'Ogooluwa Ojo', matricNumber: 'BU22CSC1105', level: 300 },
  { fullName: 'Olisaemeka Egbunike', matricNumber: 'BU22CSC1106', level: 300 },
  { fullName: 'Joshua Mba', matricNumber: 'BU22CSC1108', level: 300 },
  { fullName: 'Joshua Jonas-Nosike', matricNumber: 'BU22CSC1109', level: 300 },
  { fullName: 'Lois Sokomba', matricNumber: 'BU22CSC1112', level: 300 },
  { fullName: 'Abanise Alimi', matricNumber: 'BU22CSC1114', level: 300 },
  { fullName: 'Oluwatunmise Ayeni', matricNumber: 'BU22CSC1115', level: 300 },
  { fullName: 'Destiny Adu', matricNumber: 'BU22CSC1117', level: 300 },
  { fullName: 'Ajibola Olabode', matricNumber: 'BU22CSC1118', level: 300 },
  { fullName: 'Anjolaoluwa Onifade', matricNumber: 'BU22CSC1119', level: 300 },
  { fullName: 'Uchenna Njoku', matricNumber: 'BU22CSC1120', level: 300 },
  { fullName: 'Oluwasubomi Adenekan', matricNumber: 'BU22CSC1121', level: 300 },
  { fullName: 'Ifeoluwa Ekundayo', matricNumber: 'BU22CSC1122', level: 300 },
  { fullName: 'Mirabel Mmadubuko', matricNumber: 'BU22CSC1123', level: 300 },
  { fullName: 'Doubra Apresai', matricNumber: 'BU22CSC1124', level: 300 },
  { fullName: 'Anthony Nnawuihe', matricNumber: 'BU22CSC1125', level: 300 },
  { fullName: 'Oluwatamilore Aremu', matricNumber: 'BU22CSC1126', level: 300 },
  { fullName: 'Favour Imegu', matricNumber: 'BU22CSC1127', level: 300 },
  { fullName: 'Oluwadolabomi Aworeni', matricNumber: 'BU22CSC1128', level: 300 },
  { fullName: 'Tochukwu Okonkwo', matricNumber: 'BU22CSC1129', level: 300 },
  { fullName: 'Israel Bamidele', matricNumber: 'BU22CSC1130', level: 300 },
  { fullName: 'Ayomide Shittu', matricNumber: 'BU22CSC1131', level: 300 },
  { fullName: 'Temitope Ajisekola', matricNumber: 'BU22CSC1132', level: 300 },
  { fullName: 'Ebubechika Otuchikere', matricNumber: 'BU22CSC1133', level: 300 },
  { fullName: 'Uzochukwu Uwazie', matricNumber: 'BU22CSC1134', level: 300 },
  { fullName: 'Oluwatomiwa Ojedele', matricNumber: 'BU22CSC1135', level: 300 },
  { fullName: 'Efezino Taigbenu', matricNumber: 'BU22CSC1136', level: 300 },
  { fullName: 'Farouk Olabamiji', matricNumber: 'BU22CSC1137', level: 300 },
  { fullName: 'Joshua Aakpughe', matricNumber: 'BU22CSC1138', level: 300 },
  { fullName: 'Victor Iyanda', matricNumber: 'BU22CSC1139', level: 300 },
  { fullName: 'Ayokunle Olomu', matricNumber: 'BU22CSC1140', level: 300 },
  { fullName: 'Oluwadarasimi Mustapha', matricNumber: 'BU22CSC1141', level: 300 },
  { fullName: 'Olawunmi Amusan', matricNumber: 'BU22CSC1142', level: 300 },
  { fullName: 'Elvis Ihiasota', matricNumber: 'BU22CSC1143', level: 300 },
  { fullName: 'Daniel Daodu', matricNumber: 'BU22CSC1144', level: 300 },
  { fullName: 'Samuel Oluwamodede', matricNumber: 'BU22CSC1147', level: 300 },
  { fullName: 'Chukwuemeka Ezinmadu', matricNumber: 'BU22CSC1150', level: 300 },
  { fullName: 'Somtochukwu Muonanu', matricNumber: 'BU22CSC1151', level: 300 },
  { fullName: 'Michael Oji', matricNumber: 'BU22CSC1153', level: 300 },
  { fullName: 'Anjolaoluwa Salami', matricNumber: 'BU23CSC2001', level: 200 },
  { fullName: 'Olamide Akinjare', matricNumber: 'BU23CSC2002', level: 200 },
  { fullName: 'Icivirter Washima-Mohammed', matricNumber: 'BU23CSC2003', level: 200 },
  { fullName: 'Ademola Adeyinka', matricNumber: 'BU23CSC2004', level: 200 },
  { fullName: 'Obed Aguocha', matricNumber: 'BU23CSC2005', level: 200 },
  { fullName: 'Oyindamola Olukowade', matricNumber: 'BU23CSC2006', level: 200 },
  { fullName: 'Isaac Adoga', matricNumber: 'BU24CSC3001', level: 100 },

  // ── Software Engineering ───────────────────────────────────────────
  { fullName: 'Darasimi Salau', matricNumber: 'BU22SEN1002', level: 300 },
  { fullName: 'Favour Okah', matricNumber: 'BU22SEN1003', level: 300 },
  { fullName: 'Ayokunle Ajepe', matricNumber: 'BU22SEN1004', level: 300 },
  { fullName: 'Oluwamotemi Adebayo', matricNumber: 'BU22SEN1005', level: 300 },
  { fullName: 'Ayomikunle Daramola', matricNumber: 'BU22SEN1006', level: 300 },
  { fullName: 'Ayomide Olawoyin', matricNumber: 'BU22SEN1007', level: 300 },
  { fullName: 'Joshua Ogiesoba', matricNumber: 'BU22SEN1008', level: 300 },
  { fullName: 'Timi Gbenga', matricNumber: 'BU22SEN1009', level: 300 },
  { fullName: 'David Omisakin', matricNumber: 'BU22SEN1011', level: 300 },
  { fullName: 'Praise Kolawole', matricNumber: 'BU22SEN1012', level: 300 },
  { fullName: 'Habeeb Owoade', matricNumber: 'BU22SEN1013', level: 300 },
  { fullName: 'David-Fortune Nduonofit', matricNumber: 'BU22SEN1014', level: 300 },
  { fullName: 'Shadrach Adu', matricNumber: 'BU22SEN1015', level: 300 },
  { fullName: 'Daniel Adeleye', matricNumber: 'BU22SEN1016', level: 300 },
  { fullName: 'Ogheneosume Okoh', matricNumber: 'BU22SEN1017', level: 300 },
  { fullName: 'Victor Antigha', matricNumber: 'BU22SEN1018', level: 300 },
  { fullName: 'Gbolaga Bamidele', matricNumber: 'BU22SEN1019', level: 300 },
  { fullName: 'Emmanuel Idowu', matricNumber: 'BU22SEN1020', level: 300 },
  { fullName: 'Ribetshak Kwarkas', matricNumber: 'BU22SEN1021', level: 300 },
  { fullName: 'Makeme Ebikagboro', matricNumber: 'BU22SEN1022', level: 300 },
  { fullName: 'Tochukwu Olisagulu', matricNumber: 'BU22SEN1023', level: 300 },
  { fullName: 'Samuel Adeoye', matricNumber: 'BU22SEN1024', level: 300 },
  { fullName: 'Rawlings Ferguson', matricNumber: 'BU22SEN1026', level: 300 },
  { fullName: 'Victor Augustine', matricNumber: 'BU22SEN1027', level: 300 },
  { fullName: 'Ronald Olumorin', matricNumber: 'BU22SEN1029', level: 300 },
  { fullName: 'Evans Uwadone', matricNumber: 'BU22SEN1030', level: 300 },
  { fullName: 'Omofolawe Olabobola', matricNumber: 'BU22SEN1031', level: 300 },
  { fullName: 'Eniola Kayode', matricNumber: 'BU22SEN1032', level: 300 },
  { fullName: 'Ibrahim Raji', matricNumber: 'BU22SEN1033', level: 300 },
  { fullName: 'Emmanuel Ajibade', matricNumber: 'BU22SEN1034', level: 300 },
  { fullName: 'Akintomiwa Bello', matricNumber: 'BU22SEN1035', level: 300 },
  { fullName: 'Akomachi Ndubuka', matricNumber: 'BU22SEN1036', level: 300 },
  { fullName: 'Esther Idumu', matricNumber: 'BU22SEN1037', level: 300 },
  { fullName: 'David Afolabi', matricNumber: 'BU22SEN1038', level: 300 },
  { fullName: 'Israel Babatunde', matricNumber: 'BU22SEN1039', level: 300 },
  { fullName: 'Chisom Okafor', matricNumber: 'BU22SEN1040', level: 300 },
  { fullName: 'Emmanuel Itamunoala', matricNumber: 'BU22SEN1041', level: 300 },
  { fullName: 'Oluwakorede Bodunwa', matricNumber: 'BU22SEN1044', level: 300 },
  { fullName: 'Awodoye Oluwasemilore', matricNumber: 'BU22SEN1045', level: 300 },
  { fullName: 'Michael Oyekale', matricNumber: 'BU22SEN1046', level: 300 },
  { fullName: 'Michael Olayemi', matricNumber: 'BU22SEN1047', level: 300 },
  { fullName: 'Ebenezer Agbor', matricNumber: 'BU22SEN1048', level: 300 },
  { fullName: 'Favour Israel-Abolade', matricNumber: 'BU22SEN1049', level: 300 },
  { fullName: 'Daniel', matricNumber: 'BU22SEN1051', level: 300 },
  { fullName: 'Jemimah Agbe', matricNumber: 'BU22SEN1052', level: 300 },
  { fullName: 'Oluebube Anokam-Basil', matricNumber: 'BU22SEN1054', level: 300 },
  { fullName: 'Chukwuno Oham', matricNumber: 'BU22SEN1055', level: 300 },
  { fullName: 'Emmanuel Owolabi', matricNumber: 'BU22SEN1057', level: 300 },
  { fullName: 'Daniel Akin-Adeola', matricNumber: 'BU22SEN1059', level: 300 },
  { fullName: 'Bolutife Omojola', matricNumber: 'BU23SEN2001', level: 200 },
  { fullName: 'Philip Kolawole', matricNumber: 'BU23SEN2002', level: 200 },
  { fullName: 'Oluwakayode Bewaji', matricNumber: 'BU23SEN2003', level: 200 },

  // ── Cyber Security ─────────────────────────────────────────────────
  { fullName: 'Erioluwa Oyedokun', matricNumber: 'BU21CYB1009', level: 400 },
  { fullName: 'Inioluwa Obadina', matricNumber: 'BU22CYB1001', level: 300 },
  { fullName: 'Samuel Adeyemo', matricNumber: 'BU22CYB1002', level: 300 },
  { fullName: 'Abraham Isaac', matricNumber: 'BU22CYB1003', level: 300 },
  { fullName: 'Bolarinwa Boladale', matricNumber: 'BU22CYB1004', level: 300 },
  { fullName: 'Temitope Iyayi', matricNumber: 'BU22CYB1005', level: 300 },
  { fullName: 'Emmanuel Kalejaiye', matricNumber: 'BU22CYB1006', level: 300 },
  { fullName: 'Abdulbaary Kolapo', matricNumber: 'BU22CYB1007', level: 300 },
  { fullName: 'Olayinka Agboola', matricNumber: 'BU22CYB1008', level: 300 },
  { fullName: 'Gabriel Odey', matricNumber: 'BU22CYB1009', level: 300 },
  { fullName: 'Joseph Akor', matricNumber: 'BU22CYB1010', level: 300 },
  { fullName: 'Daniel Zanak', matricNumber: 'BU22CYB1011', level: 300 },
  { fullName: 'Salem Kajotoni', matricNumber: 'BU22CYB1012', level: 300 },
  { fullName: 'Alagbe Alagbe', matricNumber: 'BU22CYB1013', level: 300 },
  { fullName: 'Increase Barikpe', matricNumber: 'BU22CYB1014', level: 300 },
  { fullName: 'Victor Fadipe', matricNumber: 'BU22CYB1015', level: 300 },
  { fullName: 'Iyioluwa Adeyemi', matricNumber: 'BU22CYB1017', level: 300 },
  { fullName: 'Eyimofe Olajolo', matricNumber: 'BU22CYB1018', level: 300 },
  { fullName: 'Daniella Aito', matricNumber: 'BU23CYB2001', level: 200 },

  // ── Information Technology ─────────────────────────────────────────
  { fullName: 'Olakunmi Adeoya', matricNumber: 'BU22IFT1001', level: 300 },
  { fullName: 'Joy Godwin', matricNumber: 'BU22IFT1002', level: 300 },
  { fullName: 'Victoria Olanrewaju', matricNumber: 'BU22IFT1004', level: 300 },
  { fullName: 'Charles Adisa', matricNumber: 'BU22IFT1007', level: 300 },
  { fullName: 'Richard Makinde', matricNumber: 'BU22IFT1009', level: 300 },
  { fullName: 'Bivan Batan', matricNumber: 'BU22IFT1010', level: 300 },
];

const adminUser = {
  email: 'admin@nacos.bowen.edu.ng',
  fullName: 'NACOS Admin',
  matricNumber: 'ADMIN001',
  password: 'admin@nacos2024',
};

async function main() {
  console.log('Seeding database...');

  // Departments
  console.log('Creating departments...');
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      create: dept,
      update: { name: dept.name },
    });
  }

  // Roles
  console.log('Creating roles...');
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      create: { name: role },
      update: {},
    });
  }

  // Student registry
  console.log(`Seeding ${students.length} students into registry...`);
  for (const student of students) {
    await prisma.studentRegistry.upsert({
      where: { matricNumber: student.matricNumber.toUpperCase() },
      create: {
        fullName: student.fullName,
        matricNumber: student.matricNumber.toUpperCase(),
        level: student.level,
      },
      update: {
        fullName: student.fullName,
        level: student.level,
      },
    });
  }

  // Admin account
  console.log('Creating admin account...');
  const cscDept = await prisma.department.findUnique({ where: { code: 'CSC' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  if (cscDept && adminRole) {
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    const admin = await prisma.user.upsert({
      where: { email: adminUser.email },
      create: {
        email: adminUser.email,
        fullName: adminUser.fullName,
        matricNumber: adminUser.matricNumber,
        password: hashedPassword,
        level: 400,
        departmentId: cscDept.id,
        roles: { create: { roleId: adminRole.id } },
      },
      update: {},
    });
    console.log(`Admin: ${admin.email} / password: ${adminUser.password}`);
  }

  console.log(`Done. ${students.length} students loaded into registry.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
