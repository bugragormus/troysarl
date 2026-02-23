import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";
import { Transaction } from "@/types/transaction";
import Car from "@/types/car";

// Yardımcı bileşen
const DetailItem = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className={`font-medium dark:text-gray-200 ${className || ""}`}>
      {value}
    </span>
  </div>
);

type TransactionManagerProps = {
  cars: Car[];
};

export default function TransactionManager({ cars }: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [customerFullname, setCustomerFullname] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("nakit");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState<number>();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>();
  const [transactionType, setTransactionType] = useState<"rental" | "sale">(
    "sale"
  );

  // Fetch Transactions On Mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Veri çekme hatası: " + error.message);
      Sentry.captureException(error);
    } else {
      setTransactions(data || []);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCarId ||
      !customerFullname ||
      !phoneNumber ||
      !startDate ||
      !totalPrice ||
      !paymentMethod
    ) {
      toast.error("Zorunlu alanları doldurun! (*)");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            car_id: selectedCarId,
            customer_fullname: customerFullname,
            phone_number: phoneNumber,
            start_date: startDate,
            end_date: transactionType === "rental" ? endDate : null,
            total_price: totalPrice,
            transaction_type: transactionType,
            chassis_number: chassisNumber,
            payment_method: paymentMethod,
            purchase_date: purchaseDate,
            purchase_amount: purchaseAmount,
            invoice_number: invoiceNumber,
            seller_name: sellerName,
          },
        ])
        .select();

      if (error) throw error;
      if (data?.[0]) {
        setTransactions((prev) => [data[0], ...prev]);
        // Formu temizle
        setCustomerFullname("");
        setPhoneNumber("");
        setTotalPrice(undefined);
        setChassisNumber("");
        setPaymentMethod("nakit");
        setPurchaseDate("");
        setPurchaseAmount(undefined);
        setInvoiceNumber("");
        setSellerName("");
        setStartDate("");
        setEndDate("");
        toast.success("İşlem başarıyla eklendi!");
      }
    } catch (error) {
      console.error("Hata:", error);
      Sentry.captureException(error);
      toast.error("İşlem eklenirken hata oluştu.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm("Bu işlemi silmek istediğinizden emin misiniz?"))
      return;

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("İşlem silindi.");
    } catch (error) {
      toast.error("Silme işlemi başarısız!");
      Sentry.captureException(error);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        İşlem Kayıtları
      </h2>

      {/* Yeni İşlem Formu */}
      <form onSubmit={handleAddTransaction} className="mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Araba ve İşlem Tipi Seçimi */}
          <select
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            required
          >
            <option value="">Araba Seçin*</option>
            {cars
              .filter((car) => car.listing_type !== "sold") // Sold durumunu filtrele
              .map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} ({car.color})
                </option>
              ))}
          </select>

          <select
            value={transactionType}
            onChange={(e) =>
              setTransactionType(e.target.value as "rental" | "sale")
            }
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="rental">Kiralama</option>
            <option value="sale">Satış</option>
          </select>

          {/* Müşteri Bilgileri */}
          <input
            type="text"
            placeholder="Müşteri Adı*"
            value={customerFullname}
            onChange={(e) => setCustomerFullname(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            required
          />

          <input
            type="tel"
            placeholder="Telefon Numarası*"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            required
          />

          {/* İşlem Bilgileri */}
          <div className="space-y-4 col-span-full border-t pt-4">
            <h3 className="text-lg font-semibold dark:text-white">
              Araç Satış/Kiralama Bilgileri
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="date"
                placeholder="Başlangıç Tarihi*"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                required
              />

              {transactionType === "rental" && (
                <input
                  type="date"
                  placeholder="Bitiş Tarihi"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              )}

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                required
              >
                <option value="nakit">Nakit</option>
                <option value="kredi_karti">Kredi Kartı</option>
                <option value="havale">Havale/EFT</option>
              </select>

              <input
                type="text"
                placeholder="Satıcı Adı"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />

              <input
                type="number"
                placeholder="Toplam Fiyat (€)*"
                value={totalPrice || ""}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
          </div>

          {/* Ödeme ve Araç Bilgileri */}
          <div className="space-y-4 col-span-full border-t pt-4">
            <h3 className="text-lg font-semibold dark:text-white">
              Araç Alım Bilgileri
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Şasi No"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />

              <input
                type="date"
                placeholder="Alım Tarihi"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />

              <input
                type="number"
                placeholder="Alış Tutarı (€)"
                value={purchaseAmount || ""}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />

              <input
                type="text"
                placeholder="Alış Fatura No"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg transition-all duration-300 font-semibold"
        >
          İşlemi Kaydet
        </button>
      </form>

      {/* İşlem Listesi */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Araba</th>
              <th className="p-3 text-left">Şasi No</th>
              <th className="p-3 text-left">Satış Tarihi</th>
              <th className="p-3 text-left">Kar Miktarı</th>
              <th className="p-3 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const car = cars.find((c) => c.id === t.car_id);
              const profit = t.total_price - (t.purchase_amount || 0);

              return (
                <tr
                  key={t.id}
                  className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3">
                    {car ? `${car.brand} ${car.model}` : "Silinmiş Araç"}
                  </td>
                  <td className="p-3">{t.chassis_number || "-"}</td>
                  <td className="p-3">
                    {new Date(t.start_date).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-semibold text-green-600">
                    €{profit.toLocaleString()}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => setSelectedTransaction(t)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Detayları Göster
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Detay Popup */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold dark:text-white">
                İşlem Detayları
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Müşteri Bilgileri */}
              <div className="space-y-2">
                <DetailItem
                  label="Müşteri Adı"
                  value={selectedTransaction.customer_fullname}
                />
                <DetailItem
                  label="Telefon"
                  value={selectedTransaction.phone_number}
                />
                <DetailItem
                  label="Ödeme Şekli"
                  value={selectedTransaction.payment_method}
                />
              </div>

              {/* Araç Bilgileri */}
              <div className="space-y-2">
                <DetailItem
                  label="Şasi No"
                  value={selectedTransaction.chassis_number || ""}
                />
                <DetailItem
                  label="Satıcı"
                  value={selectedTransaction.seller_name || ""}
                />
                <DetailItem
                  label="Alış Tarihi"
                  value={
                    selectedTransaction.purchase_date
                      ? new Date(
                          selectedTransaction.purchase_date
                        ).toLocaleDateString()
                      : "-"
                  }
                />
              </div>

              {/* Finansal Bilgiler */}
              <div className="space-y-2">
                <DetailItem
                  label="Alış Tutarı"
                  value={
                    selectedTransaction.purchase_amount
                      ? `€${selectedTransaction.purchase_amount.toLocaleString()}`
                      : "-"
                  }
                />
                <DetailItem
                  label="Satış Tutarı"
                  value={`€${selectedTransaction.total_price.toLocaleString()}`}
                />
                <DetailItem
                  label="Kar Miktarı"
                  value={`€${(
                    selectedTransaction.total_price -
                    (selectedTransaction.purchase_amount || 0)
                  ).toLocaleString()}`}
                  className="text-green-500 font-semibold"
                />
              </div>

              {/* Diğer Bilgiler */}
              <div className="space-y-2">
                <DetailItem
                  label="İşlem Tarihi"
                  value={new Date(
                    selectedTransaction.start_date
                  ).toLocaleDateString()}
                />
                {selectedTransaction.transaction_type === "rental" && (
                  <DetailItem
                    label="Bitiş Tarihi"
                    value={
                      selectedTransaction.end_date
                        ? new Date(selectedTransaction.end_date).toLocaleDateString()
                        : "-"
                    }
                  />
                )}
                <DetailItem
                  label="Fatura No"
                  value={selectedTransaction.invoice_number || ""}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
