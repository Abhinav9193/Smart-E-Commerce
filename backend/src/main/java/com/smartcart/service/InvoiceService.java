package com.smartcart.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartcart.entity.Order;
import com.smartcart.entity.OrderItem;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public byte[] generateInvoicePdf(Order order) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            DeviceRgb primaryColor = new DeviceRgb(79, 70, 229);
            DeviceRgb grayColor = new DeviceRgb(107, 114, 128);

            // Header
            Paragraph header = new Paragraph("SMARTCART")
                    .setFontSize(28)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            Paragraph subtitle = new Paragraph("TAX INVOICE")
                    .setFontSize(14)
                    .setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(subtitle);

            // Order info
            document.add(new Paragraph("Order #: " + order.getOrderNumber())
                    .setFontSize(11).setBold());
            document.add(new Paragraph("Date: " + order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")))
                    .setFontSize(10).setFontColor(grayColor));
            document.add(new Paragraph("Status: " + order.getStatus().name())
                    .setFontSize(10).setFontColor(grayColor));
            document.add(new Paragraph("Customer: " + order.getUser().getFullName())
                    .setFontSize(10));
            document.add(new Paragraph("Email: " + order.getUser().getEmail())
                    .setFontSize(10));

            if (order.getShippingAddress() != null) {
                document.add(new Paragraph("Shipping Address: " + order.getShippingAddress())
                        .setFontSize(10).setMarginBottom(15));
            }

            // Product table
            float[] columnWidths = {1, 4, 1, 2, 2};
            Table table = new Table(UnitValue.createPercentArray(columnWidths))
                    .useAllAvailableWidth()
                    .setMarginTop(15);

            // Table header
            String[] headers = {"#", "Product", "Qty", "Price", "Total"};
            for (String h : headers) {
                Cell cell = new Cell()
                        .add(new Paragraph(h).setBold().setFontSize(10).setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(primaryColor)
                        .setPadding(8);
                table.addHeaderCell(cell);
            }

            // Table rows
            int index = 1;
            for (OrderItem item : order.getItems()) {
                DeviceRgb rowBg = index % 2 == 0 ? new DeviceRgb(243, 244, 246) : new DeviceRgb(255, 255, 255);

                table.addCell(new Cell().add(new Paragraph(String.valueOf(index)).setFontSize(9))
                        .setBackgroundColor(rowBg).setPadding(6));
                table.addCell(new Cell().add(new Paragraph(item.getProductName()).setFontSize(9))
                        .setBackgroundColor(rowBg).setPadding(6));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity())).setFontSize(9))
                        .setBackgroundColor(rowBg).setPadding(6));
                table.addCell(new Cell().add(new Paragraph("₹" + item.getPriceAtPurchase().setScale(2)).setFontSize(9))
                        .setBackgroundColor(rowBg).setPadding(6));
                table.addCell(new Cell().add(new Paragraph("₹" + item.getSubtotal().setScale(2)).setFontSize(9))
                        .setBackgroundColor(rowBg).setPadding(6));
                index++;
            }

            document.add(table);

            // Totals
            document.add(new Paragraph("")
                    .setMarginTop(20));

            Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{6, 2}))
                    .useAllAvailableWidth();

            totalsTable.addCell(new Cell().add(new Paragraph("Subtotal:").setFontSize(11).setTextAlignment(TextAlignment.RIGHT))
                    .setBorder(null).setPadding(4));
            totalsTable.addCell(new Cell().add(new Paragraph("₹" + order.getSubtotal().setScale(2)).setFontSize(11))
                    .setBorder(null).setPadding(4));

            totalsTable.addCell(new Cell().add(new Paragraph("GST (" + order.getGstRate() + "%):").setFontSize(11).setTextAlignment(TextAlignment.RIGHT))
                    .setBorder(null).setPadding(4));
            totalsTable.addCell(new Cell().add(new Paragraph("₹" + order.getGstAmount().setScale(2)).setFontSize(11))
                    .setBorder(null).setPadding(4));

            totalsTable.addCell(new Cell().add(new Paragraph("TOTAL:").setFontSize(13).setBold().setTextAlignment(TextAlignment.RIGHT).setFontColor(primaryColor))
                    .setBorder(null).setPadding(4));
            totalsTable.addCell(new Cell().add(new Paragraph("₹" + order.getTotalAmount().setScale(2)).setFontSize(13).setBold().setFontColor(primaryColor))
                    .setBorder(null).setPadding(4));

            document.add(totalsTable);

            // Footer
            document.add(new Paragraph("Thank you for shopping with SmartCart!")
                    .setFontSize(10)
                    .setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(30));

            document.add(new Paragraph("This is a computer-generated invoice and does not require a signature.")
                    .setFontSize(8)
                    .setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice PDF: " + e.getMessage(), e);
        }
    }
}
