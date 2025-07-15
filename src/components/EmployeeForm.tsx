import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Employee {
  id?: string;
  name: string;
  employeeNumber: string;
  email: string;
  phone: string;
}

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (employee: Omit<Employee, 'id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    employeeNumber: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        employeeNumber: employee.employeeNumber || '',
        email: employee.email || '',
        phone: employee.phone || ''
      });
    } else {
      setFormData({
        name: '',
        employeeNumber: '',
        email: '',
        phone: ''
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeNumber">Employee Number</Label>
            <Input
              id="employeeNumber"
              type="text"
              value={formData.employeeNumber}
              onChange={handleChange('employeeNumber')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim() || !formData.email.trim()}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : (employee ? 'Update' : 'Add Employee')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};