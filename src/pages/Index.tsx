import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmployeeForm } from '@/components/EmployeeForm';
import { EmployeeTable } from '@/components/EmployeeTable';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Plus } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  employeeNumber: string;
  email: string;
  phone: string;
}

const Index = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSendingStates, setEmailSendingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch employees: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      setIsSubmitting(true);
      
      if (editingEmployee) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Employee updated successfully!",
        });
      } else {
        // Add new employee
        const { error } = await supabase
          .from('employees')
          .insert([employeeData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Employee added successfully!",
        });
      }
      
      await fetchEmployees();
      handleCancel();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save employee: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Employee deleted successfully!",
      });
      
      await fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete employee: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (employee: Employee) => {
    setEmailSendingStates(prev => ({ ...prev, [employee.id]: true }));
    
    try {
      const payload = {
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeNumber || employee.id,
        department: 'General',
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase.functions.invoke('send-employee-email', {
        body: payload
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Email sent successfully to ${employee.email}`,
      });
    } catch (error: any) {
      console.error('Email send error:', error);
      toast({
        title: "Email Error",
        description: `Failed to send email to ${employee.email}. ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setEmailSendingStates(prev => ({ ...prev, [employee.id]: false }));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Employee Manager</h1>
          <p className="text-muted-foreground">Manage your employee database with CRUD operations and email notifications</p>
        </div>

        {/* Add Employee Button */}
        {!showForm && (
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowForm(true)} 
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Employee
            </Button>
          </div>
        )}

        {/* Employee Form */}
        {showForm && (
          <div className="flex justify-center">
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* Employee Table */}
        <EmployeeTable
          employees={employees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSendEmail={handleSendEmail}
          emailSendingStates={emailSendingStates}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
