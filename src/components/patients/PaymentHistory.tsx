import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Plus, Receipt, Calendar, Edit, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayments } from '@/hooks/usePayments';

interface PaymentHistoryProps {
  patientId: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { addPayment, updatePayment, deletePayment, getPaymentsByPatient, getPaymentSummaryForPatient, refreshPayments } = usePayments();
  const [patientPayments, setPatientPayments] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState({
    totalCost: 0,
    totalPaid: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching payment data for patient:', patientId);
      
      // Get payment summary and patient payments in parallel
      const [summary, payments] = await Promise.all([
        getPaymentSummaryForPatient(patientId),
        getPaymentsByPatient(patientId)
      ]);
      
      console.log('Payment summary loaded:', summary);
      console.log('Patient payments loaded:', payments?.length || 0);
      
      setPaymentSummary(summary);
      setPatientPayments(payments);
      
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history from database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh when patient changes
  useEffect(() => {
    if (patientId) {
      console.log('Patient ID changed, loading payment data for:', patientId);
      fetchPaymentData();
    }
  }, [patientId]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      console.log('Manual refresh triggered');
      await refreshPayments();
      await fetchPaymentData();
      
      toast({
        title: "Data Refreshed",
        description: "Payment data has been updated successfully.",
      });
    } catch (error) {
      console.error('Error refreshing payment data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh payment data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding new payment:', newPayment);
      
      const paymentData = {
        patient_id: patientId,
        amount: parseFloat(newPayment.amount),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: newPayment.paymentMethod,
        notes: newPayment.notes
      };

      await addPayment(paymentData);
      
      // Refresh payment data immediately
      await fetchPaymentData();
      
      setNewPayment({ amount: '', paymentMethod: 'cash', notes: '' });
      setIsDialogOpen(false);
      
      toast({
        title: "Payment Added",
        description: `Payment of ₹${paymentData.amount} has been saved to database.`,
      });
      
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Database Error",
        description: "Failed to save payment to database. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setNewPayment({
      amount: payment.amount.toString(),
      paymentMethod: payment.payment_method,
      notes: payment.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment || !newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Updating payment:', editingPayment.id, newPayment);
      
      const updates = {
        amount: parseFloat(newPayment.amount),
        payment_method: newPayment.paymentMethod,
        notes: newPayment.notes
      };

      await updatePayment(editingPayment.id, updates);
      
      // Refresh payment data immediately
      await fetchPaymentData();
      
      setNewPayment({ amount: '', paymentMethod: 'cash', notes: '' });
      setEditingPayment(null);
      setIsDialogOpen(false);
      
      toast({
        title: "Payment Updated",
        description: `Payment has been updated in database.`,
      });
      
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Database Error",
        description: "Failed to update payment in database.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) {
      return;
    }

    try {
      console.log('Deleting payment:', paymentId);
      
      await deletePayment(paymentId);
      
      // Refresh payment data immediately
      await fetchPaymentData();
      
      toast({
        title: "Payment Deleted",
        description: "Payment record has been deleted from database.",
      });
      
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Database Error",
        description: "Failed to delete payment from database.",
        variant: "destructive",
      });
    }
  };

  const resetDialog = () => {
    setNewPayment({ amount: '', paymentMethod: 'cash', notes: '' });
    setEditingPayment(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading payment data from database...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment History (Database)
            </CardTitle>
            <CardDescription>
              Track payments and outstanding balance - All data saved to Supabase
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setEditingPayment(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPayment ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
                  <DialogDescription>
                    {editingPayment ? 'Update payment record in database' : 'Add a new payment record to database'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select
                      value={newPayment.paymentMethod}
                      onValueChange={(value) => setNewPayment(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Payment notes or reference"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={editingPayment ? handleUpdatePayment : handleAddPayment} 
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingPayment ? 'Update Payment' : 'Save to Database'}
                    </Button>
                    <Button variant="outline" onClick={resetDialog} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Enhanced Balance Summary with Real-time Updates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Cost</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{paymentSummary.totalCost.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 mt-1">From treatments & lab work</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Paid</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                ₹{paymentSummary.totalPaid.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">From database records</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Outstanding Balance</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                ₹{paymentSummary.balance.toLocaleString()}
              </div>
              <Badge className={paymentSummary.balance > 0 ? 'bg-orange-100 text-orange-700 mt-2' : 'bg-green-100 text-green-700 mt-2'}>
                {paymentSummary.balance > 0 ? 'Pending' : 'Paid'}
              </Badge>
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-2">
            <h4 className="font-medium text-slate-900">Payment Records ({patientPayments.length})</h4>
            {patientPayments.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <p>No payments recorded in database yet</p>
              </div>
            ) : (
              patientPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-slate-500">{payment.payment_method}</div>
                      {payment.notes && (
                        <div className="text-xs text-slate-400">{payment.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {payment.payment_date}
                      </div>
                      <div className="text-xs text-green-600">Saved in DB</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPayment(payment)}
                      title="Edit Payment"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePayment(payment.id)}
                      title="Delete Payment"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};