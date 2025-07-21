import React from 'react';
import { useParams } from 'react-router-dom';
import AdminEditProduct from './AdminEditProduct';

const AdminEditWrapper = () => {
  const { productId } = useParams();
  return <AdminEditProduct productId={productId} />;
};

export default AdminEditWrapper;
