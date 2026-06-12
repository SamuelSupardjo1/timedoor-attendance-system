import Swal from 'sweetalert2';

// Custom configuration helper for SweetAlert2 using standard styled custom classes
export const showAlert = {
  confirm: async (title, text = '') => {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-xl text-sm border-0 cursor-pointer outline-none transition mx-2',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-xl text-sm border-0 cursor-pointer outline-none transition mx-2'
      },
      buttonsStyling: false
    });
  },
  success: (title, text = '') => {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-xl text-sm border-0 cursor-pointer outline-none transition'
      },
      buttonsStyling: false
    });
  },
  error: (title, text = '') => {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2 rounded-xl text-sm border-0 cursor-pointer outline-none transition'
      },
      buttonsStyling: false
    });
  }
};
