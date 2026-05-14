export interface SheetFormData {
  type: 'Private Coaching' | 'Class Booking' | 'Gym Visit' | 'General Contact';
  name: string;
  phone: string;
  email: string;
  details?: string;
  location?: string;
  coach?: string;
  course?: string;
}

export const submitToSheet = async (data: SheetFormData) => {
  try {
    const response = await fetch('/api/sheet-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};
