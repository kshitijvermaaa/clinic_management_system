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

  useEffect(() => {
    fetchPaymentData();
  }, [patientId]);

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      
      // Get payment summary and patient payments
      const [summary, payments] = await Promise.all([
        getPaymentSummaryForPatient(patientId),
        getPaymentsByPatient(patientId)
      ]);
      
      setPaymentSummary(summary);
      setPatientPayments(payments);
      
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
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
        description: `Payment of ₹${paymentData.amount} has been recorded.`,
      });
      
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment.",
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
        description: `Payment has been updated successfully.`,
      });
      
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) {
      return;
    }

    try {
      await deletePayment(paymentId);
      
      // Refresh payment data immediately
      await fetchPaymentData();
      
      toast({
        title: "Payment Deleted",
        description: "Payment record has been deleted.",
      });
      
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment.",
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
              Payment History
            </CardTitle>
            <CardDescription>
              Track payments and outstanding balance
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
                    {editingPayment ? 'Update payment record for this patient' : 'Add a new payment record for this patient'}
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
                      {editingPayment ? 'Update Payment' : 'Record Payment'}
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
          {/* Enhanced Balance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Cost</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{paymentSummary.totalCost.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Paid</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                ₹{paymentSummary.totalPaid.toLocaleString()}
              </div>
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
            <h4 className="font-medium text-slate-900">Recent Payments</h4>
            {patientPayments.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <p>No payments recorded yet</p>
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