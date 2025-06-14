
import { useState } from "react";
import { BarChart3, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface ReportControlsProps {
  reportType: string;
  onReportTypeChange: (type: string) => void;
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
  onExportReport: () => void;
}

const ReportControls = ({
  reportType,
  onReportTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onExportReport,
}: ReportControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Inventory Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Report Type
            </label>
            <Select value={reportType} onValueChange={onReportTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Summary</SelectItem>
                <SelectItem value="movement">Movement Analysis</SelectItem>
                <SelectItem value="valuation">Stock Valuation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Start Date
            </label>
            <DatePicker
              date={startDate}
              onDateChange={onStartDateChange}
              placeholder="Start date"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              End Date
            </label>
            <DatePicker
              date={endDate}
              onDateChange={onEndDateChange}
              placeholder="End date"
            />
          </div>
          <Button onClick={onExportReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportControls;
