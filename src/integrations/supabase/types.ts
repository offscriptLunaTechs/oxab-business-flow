export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_statements: {
        Row: {
          closing_balance: number | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          invoice_count: number | null
          opening_balance: number | null
          period_end: string
          period_start: string
          statement_date: string
          total_outstanding: number | null
          updated_at: string | null
        }
        Insert: {
          closing_balance?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          invoice_count?: number | null
          opening_balance?: number | null
          period_end: string
          period_start: string
          statement_date: string
          total_outstanding?: number | null
          updated_at?: string | null
        }
        Update: {
          closing_balance?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          invoice_count?: number | null
          opening_balance?: number | null
          period_end?: string
          period_start?: string
          statement_date?: string
          total_outstanding?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_statements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_pricing: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          effective_date: string | null
          expires_date: string | null
          id: string
          is_active: boolean | null
          price: number
          product_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          effective_date?: string | null
          expires_date?: string | null
          id?: string
          is_active?: boolean | null
          price: number
          product_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          effective_date?: string | null
          expires_date?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          product_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_pricing_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          code: string
          created_at: string
          customer_type: string
          email: string | null
          id: string
          loyalty_points: number
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          customer_type?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          customer_type?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          reference_id: string | null
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          reference_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          reference_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          last_restock_date: string | null
          last_updated: string
          notes: string | null
          product_id: string
          quantity: number
          reorder_level: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_restock_date?: string | null
          last_updated?: string
          notes?: string | null
          product_id: string
          quantity?: number
          reorder_level?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_restock_date?: string | null
          last_updated?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reorder_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          price: number
          product_id: string
          quantity: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          price: number
          product_id: string
          quantity: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          price?: number
          product_id?: string
          quantity?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          allocated_amount: number
          created_at: string | null
          id: string
          invoice_id: string
          payment_id: string
        }
        Insert: {
          allocated_amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          payment_id: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "customer_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string
          date: string
          discount: number
          due_date: string
          id: string
          notes: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          date: string
          discount?: number
          due_date: string
          id: string
          notes?: string | null
          status: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          date?: string
          discount?: number
          due_date?: string
          id?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      price_quotation_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          pack_size: number | null
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          quotation_id: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          pack_size?: number | null
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          quotation_id: string
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          pack_size?: number | null
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          quotation_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "price_quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      price_quotations: {
        Row: {
          company_name: string
          contact_address: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          customer_id: string | null
          greeting: string | null
          id: string
          introduction: string | null
          lead_status: string
          sign_off: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id?: string | null
          greeting?: string | null
          id?: string
          introduction?: string | null
          lead_status?: string
          sign_off?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id?: string | null
          greeting?: string | null
          id?: string
          introduction?: string | null
          lead_status?: string
          sign_off?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          id: string
          name: string
          pack_size: number | null
          size: string
          sku: string
          trademark: string | null
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pack_size?: number | null
          size: string
          sku: string
          trademark?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pack_size?: number | null
          size?: string
          sku?: string
          trademark?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          date: string
          expected_delivery_date: string | null
          id: string
          notes: string | null
          rfq_id: string | null
          status: string
          subtotal: number
          supplier_id: string
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          expected_delivery_date?: string | null
          id: string
          notes?: string | null
          rfq_id?: string | null
          status: string
          subtotal: number
          supplier_id: string
          tax?: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          rfq_id?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      retail_transaction_items: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          quantity: number
          total: number
          transaction_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          quantity: number
          total: number
          transaction_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          quantity?: number
          total?: number
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "retail_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_transactions: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          payment_method: string
          status: string
          total_amount: number
          transaction_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          status?: string
          total_amount: number
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          status?: string
          total_amount?: number
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_custom_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          quantity: number
          quantity_type: string
          rfq_id: string
          shipping_terms: string
          target_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity: number
          quantity_type?: string
          rfq_id: string
          shipping_terms?: string
          target_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          quantity_type?: string
          rfq_id?: string
          shipping_terms?: string
          target_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_custom_items_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_items: {
        Row: {
          created_at: string
          id: string
          price: number | null
          product_id: string
          quantity: number
          quantity_type: string
          rfq_id: string
          shipping_terms: string
          target_price: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price?: number | null
          product_id: string
          quantity: number
          quantity_type?: string
          rfq_id: string
          shipping_terms?: string
          target_price?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number | null
          product_id?: string
          quantity?: number
          quantity_type?: string
          rfq_id?: string
          shipping_terms?: string
          target_price?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_items_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          date: string
          expiry_date: string
          id: string
          notes: string | null
          status: string
          subtotal: number
          supplier_id: string
          total: number
          updated_at: string
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          date: string
          expiry_date: string
          id: string
          notes?: string | null
          status: string
          subtotal: number
          supplier_id: string
          total: number
          updated_at?: string
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          date?: string
          expiry_date?: string
          id?: string
          notes?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          event_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          severity: string | null
          table_name: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          severity?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          severity?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          movement_type: string
          new_stock: number
          performed_by: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reason: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          movement_type: string
          new_stock: number
          performed_by?: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reason?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          movement_type?: string
          new_stock?: number
          performed_by?: string | null
          previous_stock?: number
          product_id?: string
          quantity?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_pricing: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_pricing_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      customer_statements_view: {
        Row: {
          account_status: string | null
          closing_balance: number | null
          created_at: string | null
          created_by: string | null
          customer_code: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_type: string | null
          id: string | null
          invoice_count: number | null
          opening_balance: number | null
          period_end: string | null
          period_start: string | null
          statement_date: string | null
          total_outstanding: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_statements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      low_stock_products: {
        Row: {
          id: string | null
          name: string | null
          needs_reorder: boolean | null
          quantity: number | null
          reorder_level: number | null
          sku: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_create_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_role?: string
          p_department?: string
        }
        Returns: Json
      }
      admin_reset_user_password: {
        Args: { p_user_email: string }
        Returns: Json
      }
      allocate_payment_to_invoices: {
        Args: { p_payment_id: string; p_customer_id: string; p_amount: number }
        Returns: undefined
      }
      generate_customer_code: {
        Args: { customer_type: string }
        Returns: string
      }
      generate_customer_statement: {
        Args: {
          p_customer_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          statement_id: string
          customer_name: string
          customer_code: string
          opening_balance: number
          closing_balance: number
          total_outstanding: number
          invoice_count: number
        }[]
      }
      get_customer_outstanding_balance: {
        Args: { p_customer_id: string }
        Returns: number
      }
      get_customer_price: {
        Args: { p_customer_id: string; p_product_id: string; p_date?: string }
        Returns: number
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_inventory_variance_summary: {
        Args: { p_months?: number }
        Returns: {
          positive_variance: number
          negative_variance: number
          net_variance: number
        }[]
      }
      get_monthly_inventory_movements: {
        Args: { p_months?: number }
        Returns: {
          month: string
          inbound: number
          outbound: number
          variance: number
        }[]
      }
      get_outstanding_invoices_report: {
        Args: {
          p_customer_id?: string
          p_start_date?: string
          p_end_date?: string
          p_min_amount?: number
        }
        Returns: {
          invoice_id: string
          customer_id: string
          customer_name: string
          customer_code: string
          customer_type: string
          invoice_date: string
          due_date: string
          total_amount: number
          paid_amount: number
          outstanding_amount: number
          days_overdue: number
          aging_bucket: string
          status: string
          payment_status: string
        }[]
      }
      get_sku_monthly_movements: {
        Args: { p_months?: number }
        Returns: {
          sku: string
          product_name: string
          size: string
          month: string
          net_movement: number
          inbound: number
          outbound: number
        }[]
      }
      get_sku_stock_levels: {
        Args: Record<PropertyKey, never>
        Returns: {
          sku: string
          product_name: string
          size: string
          current_stock: number
          stock_value: number
        }[]
      }
      get_top_moving_products: {
        Args: { p_limit?: number; p_days?: number }
        Returns: {
          product_name: string
          sku: string
          total_moved: number
          movement_type: string
          percentage: number
        }[]
      }
      get_user_role_safe: {
        Args: { user_id?: string }
        Returns: string
      }
      has_permission: {
        Args: { required_role: string }
        Returns: boolean
      }
      has_role: {
        Args: { required_role: string; user_id?: string }
        Returns: boolean
      }
      initialize_inventory: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_security_event: {
        Args: {
          event_type: string
          table_name?: string
          record_id?: string
          old_data?: Json
          new_data?: Json
          severity?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      shipping_term: "EXW" | "FOB" | "CIF" | "DAP" | "DDP"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      shipping_term: ["EXW", "FOB", "CIF", "DAP", "DDP"],
    },
  },
} as const
