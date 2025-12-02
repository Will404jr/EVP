export interface User {
  id: string;
  username: string;
  email: string;
  personnelType: "Admin" | "User";
  department?: string;
}

export const users: User[] = [
  {
    id: "U001",
    username: "Admin",
    email: "admin@nssfug.org",
    personnelType: "Admin",
  },
  {
    id: "U002",
    username: "Ethel Nagaddya",
    email: "enagaddya@nssfug.org",
    personnelType: "User",
    department: "People & Culture",
  },
  {
    id: "U003",
    username: "Emmanuel Sserumaga",
    email: "esserumaga@nssfug.org",
    personnelType: "User",
    department: "TES",
  },
  {
    id: "U004",
    username: "Alex Abala",
    email: "aabala@nssfug.org",
    personnelType: "User",
    department: "People & Culture",
  },
  {
    id: "U005",
    username: "Remigious Kaggwa",
    email: "rkaggwa@nssfug.org",
    personnelType: "User",
    department: "People & Culture",
  },
  {
    id: "U006",
    username: "Abdul Makubuya",
    email: "amakubuya@nssfug.org",
    personnelType: "User",
    department: "People & Culture",
  },
  {
    id: "U007",
    username: "J.chen",
    email: "Jchen@nssf.ug",
    personnelType: "User",
    department: "HR",
  },
  {
    id: "U008",
    username: "John.brown",
    email: "brown@nssf.ug",
    personnelType: "User",
    department: "IT",
  },
  {
    id: "U009",
    username: "B.Marcus",
    email: "bmarcus@nssf.ug",
    personnelType: "User",
    department: "Operations",
  },
  {
    id: "U010",
    username: "Tom.davis",
    email: "davis@nssf.ug",
    personnelType: "User",
    department: "Operations",
  },
];
