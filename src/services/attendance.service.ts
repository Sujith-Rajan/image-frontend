import { apiFetch } from './api.service';

export interface AttendanceRecord {
  _id: string;
  userId: any;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  hoursWorked: number;
}

export const attendanceService = {
  checkIn: async () => {
    return apiFetch('/attendance/check-in', {
      method: 'POST',
    });
  },

  checkOut: async () => {
    return apiFetch('/attendance/check-out', {
      method: 'POST',
    });
  },

  getAttendance: async (params?: { startDate?: string; endDate?: string; userId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.userId) queryParams.append('userId', params.userId);

    const qs = queryParams.toString();
    const url = qs ? `/attendance?${qs}` : '/attendance';

    return apiFetch(url, {
      method: 'GET',
    });
  }
};
