import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, Receipt, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayments } from '@/hooks/usePayments';

interface PaymentHistoryProps {
  patientId: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { addPayment, getPaymentsByPatient, getPaymentSummaryForPatient } = usePayments();
  const [patientPayments, setPatientPayments] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState({
    totalCost: 0,
    totalPaid: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleAddPayment = async () => {
    if (!newPayment.amount) {
      toast({
        title: "Error",
        description: "Please enter payment amount.",
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
      
      // Refresh payment data
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment record for this patient
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    value={newPayment.paymentMethod}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Payment notes"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPayment} className="flex-1">
                    <Receipt className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Balance Summary */}
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
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {payment.payment_date}
                    </div>
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