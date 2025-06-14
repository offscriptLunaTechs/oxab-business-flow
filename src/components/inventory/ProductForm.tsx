
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useInventorySync } from "@/hooks/useInventorySync";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  size: z.string().min(1, "Size is required"),
  base_price: z.number().min(0, "Price must be positive"),
  pack_size: z.number().optional(),
  trademark: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'discontinued', 'inactive']),
  initial_stock: z.number().min(0, "Initial stock must be positive"),
  reorder_level: z.number().min(1, "Reorder level must be at least 1"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
}

const ProductForm = ({ onSuccess }: ProductFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { refreshInventoryData } = useInventorySync();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      size: "",
      base_price: 0,
      pack_size: undefined,
      trademark: "",
      description: "",
      status: "active",
      initial_stock: 0,
      reorder_level: 10,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Creating new product:', data);

      // Create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.name,
          sku: data.sku,
          size: data.size,
          base_price: data.base_price,
          pack_size: data.pack_size || null,
          trademark: data.trademark || null,
          description: data.description || null,
          status: data.status,
        })
        .select()
        .single();

      if (productError) {
        console.error('Error creating product:', productError);
        throw productError;
      }

      console.log('Product created successfully:', product);

      // Create initial inventory record
      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          product_id: product.id,
          quantity: data.initial_stock,
          reorder_level: data.reorder_level,
        });

      if (inventoryError) {
        console.error('Error creating inventory record:', inventoryError);
        throw inventoryError;
      }

      // Create stock movement record if initial stock > 0
      if (data.initial_stock > 0) {
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: product.id,
            movement_type: 'in',
            quantity: data.initial_stock,
            previous_stock: 0,
            new_stock: data.initial_stock,
            reason: 'Initial stock - Product creation',
          });

        if (movementError) {
          console.error('Error creating stock movement:', movementError);
          // Don't throw here as the product is already created
        }
      }

      toast({
        title: "Product Created",
        description: `${data.name} has been successfully created with initial stock of ${data.initial_stock}.`,
      });

      // Reset form and close modal
      form.reset();
      setIsOpen(false);
      refreshInventoryData();
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Failed to create product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (KD) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001"
                        placeholder="0.000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pack_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pack Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter pack size" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trademark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trademark</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter trademark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initial_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Stock *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
