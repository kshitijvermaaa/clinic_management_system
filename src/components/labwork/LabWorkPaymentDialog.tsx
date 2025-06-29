import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Calendar,
  CreditCard,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useLabWorkPayments, LabWorkPayment } from '@/hooks/useLabWorkPayments';
import { format } from 'date-fns';

interface LabWorkPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labWorkId: string;
  labWorkTitle: string;
  totalCost: number;
  onPaymentUpdate?: () => void;
}

export const LabWorkPaymentDialog: React.FC<LabWorkPaymentDialogProps> = ({ 
  open, 
  onOpenChange, 
  labWorkId, 
  labWorkTitle, 
  totalCost,
  onPaymentUpdate 
}) => {
  const { 
    payments, 
    isLoading, 
    fetchPaymentsByLabWork, 
    addPayment, 
    updatePayment, 
    deletePayment,
    calculateTotalPaid,
    calculateBalance 
  } = useLabWorkPayments();

  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: ''
  });

  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editPaymentData, setEditPaymentData] = useState<Partial<LabWorkPayment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && labWorkId) {
      fetchPaymentsByLabWork(labWorkId);
    }
  }, [open, labWorkId]);

  const totalPaid = calculateTotalPaid(payments);
  const balance = calculateBalance(totalCost, payments);

  const handleAddPayment = async () => {
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addPayment({
        lab_work_id: labWorkId,
        amount: parseFloat(newPayment.amount),
        payment_date: newPayment.payment_date,
        payment_method: newPayment.payment_method,
        notes: newPayment.notes || undefined
      });

      // Reset form
      setNewPayment({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        notes: ''
      });

      // Trigger refresh in parent component
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPayment = (payment: LabWorkPayment) => {
    setEditingPayment(payment.id);
    setEditPaymentData(payment);
  };

  const handleSaveEdit = async () => {
    if (!editingPayment || !editPaymentData.amount) return;

    setIsSubmitting(true);
    try {
      await updatePayment(editingPayment, editPaymentData);
      setEditingPayment(null);
      setEditPaymentData({});

      // Trigger refresh in parent component
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await deletePayment(paymentId);

      // Trigger refresh in parent component
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const getBalanceColor = () => {
    if (balance > 0) return 'text-red-600';
    if (balance < 0) return 'text-orange-600';
    return 'text-green-600';
  };

  const getBalanceLabel = () => {
    if (balance > 0) return 'Outstanding';
    if (balance < 0) return 'Overpaid';
    return 'Paid in Full';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Payment Management
          </DialogTitle>
          <DialogDescription>
            Manage payments for: {labWorkTitle}
          </DialogDescription>
        </div>
        
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-600">Total Cost</div>
              <div className="text-2xl font-bold text-blue-900">${totalCost.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-600">Total Paid</div>
              <div className="text-2xl font-bold text-green-900">${totalPaid.toFixed(2)}</div>
            </div>
            <div className={`p-4 rounded-lg border ${
              balance > 0 ? 'bg-red-50 border-red-200' : 
              balance < 0 ? 'bg-orange-50 border-orange-200' : 
              'bg-green-50 border-green-200'
            }`}>
              <div className={`text-sm font-medium ${getBalanceColor()}`}>Balance</div>
              <div className={`text-2xl font-bold ${getBalanceColor()}`}>
                ${Math.abs(balance).toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-medium text-slate-600">Status</div>
              <Badge className={
                balance > 0 ? 'bg-red-100 text-red-700 border-red-200' : 
                balance < 0 ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                'bg-green-100 text-green-700 border-green-200'
              }>
                {getBalanceLabel()}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Add New Payment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add New Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  value={newPayment.payment_method} 
                  onValueChange={(value) => setNewPayment(prev => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  onClick={handleAddPayment} 
                  disabled={!newPayment.amount || isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Payment notes or reference"
                value={newPayment.notes}
                onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Payment History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment History ({payments.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    {editingPayment === payment.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Amount ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editPaymentData.amount || ''}
                            onChange={(e) => setEditPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Payment Date</Label>
                          <Input
                            type="date"
                            value={editPaymentData.payment_date || ''}
                            onChange={(e) => setEditPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Payment Method</Label>
                          <Select 
                            value={editPaymentData.payment_method || ''} 
                            onValueChange={(value) => setEditPaymentData(prev => ({ ...prev, payment_method: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Credit/Debit Card</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>&nbsp;</Label>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleSaveEdit}
                              disabled={isSubmitting}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingPayment(null);
                                setEditPaymentData({});
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {editPaymentData.notes !== undefined && (
                          <div className="md:col-span-4 space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={editPaymentData.notes || ''}
                              onChange={(e) => setEditPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">${payment.amount.toFixed(2)}</div>
                            <div className="text-sm text-slate-600">
                              {payment.payment_method} • {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                            </div>
                            {payment.notes && (
                              <div className="text-xs text-slate-500 mt-1">{payment.notes}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};