import React, { useCallback, useState } from "react";
import { Trash2, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropzoneOptions, useDropzone } from "react-dropzone";

import { formatBytes } from "@/lib/file";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps extends Omit<DropzoneOptions, "onDrop"> {
  className?: string;
  layout?: "vertical" | "horizontal";
  uploadMode?: "single" | "multi";
  primaryText?: string;
  secondaryText?: string | null;
  maxSize?: number;
  onFilesUploaded: (files: File | File[] | null) => void;
  zodSchema?: {
    parse: (data: { file: File }) => { file: File };
  };
  errors?: string | string[];
}

type FileWithPreview = File & {
  preview: string;
};

const FileUpload: React.FC<FileUploadProps> = ({
  className,
  layout = "vertical",
  uploadMode = "single",
  primaryText,
  secondaryText,
  maxSize,
  accept: acceptedFileTypes = {},
  onFilesUploaded,
  zodSchema,
  errors: externalErrors,
  ...dropzoneProps
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [internalErrors, setInternalErrors] = useState<string | null>(null);

  const t = useTranslations("FileUpload");

  // handle the files dropped into the component
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        setInternalErrors(t("Messages.InvalidFiles"));
        return;
      }

      // clean up previous object URLs
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });

      // validate the file
      const validateFile = (file: File): string | null => {
        if (zodSchema) {
          try {
            zodSchema.parse({ file: file });
            return null;
          } catch (error: unknown) {
            console.log("Validation error:", error);
          }
        }
        return null;
      };

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ) as FileWithPreview[];

      let validationError = null;
      if (uploadMode === "single") {
        validationError = validateFile(newFiles[0]);

        if (!validationError) {
          setFiles(newFiles.slice(0, 1));
          onFilesUploaded(newFiles[0]);
          setInternalErrors(null);
        } else {
          setInternalErrors(validationError);
        }
      } else {
        // validate all files
        const errors = newFiles.map(validateFile).filter(Boolean);

        if (errors.length === 0) {
          setFiles((prev) => [...prev, ...newFiles]);
          onFilesUploaded(newFiles);
          setInternalErrors(null);
        } else {
          // display only the first error
          setInternalErrors(errors[0]);
        }
      }
    },
    [uploadMode, onFilesUploaded, zodSchema, files, t]
  );

  // configure the dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    multiple: uploadMode === "multi",
    ...dropzoneProps,
  });

  // remove a file from the list of selected files
  const removeFile = (file: FileWithPreview) => {
    const newFiles = files.filter((f) => f !== file);
    setFiles(newFiles);
    onFilesUploaded(uploadMode === "single" ? null : newFiles);
    setInternalErrors(null);
  };

  // dynamic styling
  const dropzoneClasses = cn(
    "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 hover:bg-muted/50 dark:hover:bg-input/50 w-full rounded-md border border-dashed bg-transparent p-4 text-center shadow-xs transition-[border,background,box-shadow] outline-none focus-visible:ring-[3px]",
    isDragActive &&
      "border-ring ring-ring/50 ring-[3px] bg-muted/50 dark:bg-input/50",
    layout === "horizontal"
      ? "flex items-center justify-center gap-4"
      : "flex flex-col justify-center items-center gap-2",
    className
  );

  // render the dropzone component
  const renderDropzone = () => (
    <>
      <div {...getRootProps({ className: dropzoneClasses })}>
        <input {...getInputProps()} />
        <UploadIcon className="text-muted-foreground size-6" />
        <p className="text-foreground text-sm">
          {primaryText || t("PrimaryText")}
        </p>

        {secondaryText !== null && (
          <p className="text-muted-foreground text-xs">
            {secondaryText || t("SecondaryText")}
          </p>
        )}
      </div>

      {(internalErrors || externalErrors) && (
        <p className="text-destructive text-sm">
          {internalErrors ||
            (Array.isArray(externalErrors)
              ? externalErrors.join(", ")
              : externalErrors)}
        </p>
      )}
    </>
  );

  // render the list of files that have been selected
  const renderFileList = () => (
    <div className="flex flex-col gap-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="bg-card text-card-foreground flex items-center justify-between rounded-md border p-2 shadow-xs md:p-3"
        >
          <div className="flex items-center gap-2">
            <div className="bg-accent flex size-10 items-center justify-center overflow-hidden rounded">
              <span className="text-xs font-medium">
                {file.name.split(".").pop()?.toUpperCase() || ""}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <p className="max-w-xs truncate text-sm font-medium">
                {file.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 px-0"
            onClick={() => removeFile(file)}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">{t("Remove")}</span>
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {(uploadMode === "multi" || files.length === 0) && renderDropzone()}
      {files.length > 0 && renderFileList()}
    </div>
  );
};

export default FileUpload;
