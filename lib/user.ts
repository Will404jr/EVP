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
    username: "J.Wilson",
    email: "jwilson@nssf.ug",
    personnelType: "Admin",
  },
  {
    id: "U002",
    username: "John.Doe",
    email: "john@nssf.ug",
    personnelType: "User",
    department: "IT",
  },
  {
    id: "U003",
    username: "D.Thomas",
    email: "thomas@nssf.ug",
    personnelType: "User",
    department: "HR",
  },
  {
    id: "U004",
    username: "tech.Jason",
    email: "jason@nssf.ug",
    personnelType: "User",
    department: "IT",
  },
  {
    id: "U005",
    username: "R.Miller",
    email: "miller@nssf.ug",
    personnelType: "User",
    department: "Finance",
  },
  {
    id: "U006",
    username: "Adamm.taylor",
    email: "Ataylor@nssf.ug",
    personnelType: "User",
    department: "Finance",
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
