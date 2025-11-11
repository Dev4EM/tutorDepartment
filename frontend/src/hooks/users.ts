// types/user.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  userType: 'employee' | 'admin' | 'teamleader';
}
