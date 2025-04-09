import React, { useState } from "react";
import {
  useToast,
  Box,
  Text,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Input,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import MainHeader from "@/shared/MainHeader";
import { Global } from "@emotion/react";

const FileUploadPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [sheetNames, setSheetNames] = useState([]); // Changed from sheetName to sheetNames
  const { formData } = location.state || {};
  const numCo = parseInt(formData?.Course_outcome, 10) || 0;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      setSheetNames(workbook.SheetNames); // Set all sheet names

      let extractedData = {};

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length < 2) return;

        const headers = jsonData[2];
        let rows = jsonData.slice(2).filter((row) => {
          const firstCell = row[0]?.toString().toLowerCase();
          return firstCell && !firstCell.includes("total:");
        });

        const coheaders = jsonData[1];
        const corows = jsonData.slice(1);

        const nameIndex = headers.findIndex((header) =>
          header?.toString().toLowerCase().includes("studentname")
        );
        const rollIndex = headers.findIndex((header) =>
          header?.toString().toLowerCase().includes("rollno")
        );
        const totalmarksIndex = coheaders.findIndex((header) =>
          header?.toString().toLowerCase().includes("total marks")
        );

        const totalRowIndex = rows.findIndex(
          (row) => row[0]?.toString().toLowerCase().includes("total:")
        );
        const limitedRows = totalRowIndex !== -1 ? rows.slice(0, totalRowIndex) : rows;

        const studentNames =
          nameIndex !== -1 ? limitedRows.map((row) => row[nameIndex] || "") : [];
        const rollNumbers =
          rollIndex !== -1 ? limitedRows.map((row) => row[rollIndex] || "") : [];
        const totalmarks =
          totalmarksIndex !== -1 ? corows.map((row) => row[totalmarksIndex] || "0") : [];

        let coData = {};
        for (let i = 1; i <= numCo; i++) {
          const coIndex = coheaders.findIndex((header) =>
            header?.toString().toLowerCase().startsWith(`total of co${i}`)
          );
          coData[`CO${i}`] = coIndex !== -1 ? corows.map((row) => row[coIndex] || 0) : [];
        }

        if (Object.keys(coData).length > 0) {
          extractedData[sheetName] = {
            ...coData,
            studentNames,
            rollNumbers,
            totalmarks,
          };
        }
      });

      setFileContents(extractedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleViewUploaded = () => {
    if (!selectedFile) {
      toast({
        title: "No File Uploaded",
        description: "Please upload a file before proceeding.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    setTimeout(() => {
      toast({
        title: "Upload Successful",
        description: "File uploaded successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });

      navigate("/uploaded-files", { state: { fileContents } });
    }, 2000);
  };

  return (
    <>
      <MainHeader />
      <Global
        styles={{
          body: {
            background: "url('/b.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          },
        }}
      />
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="rgba(255, 255, 255, 0.7)"
        backdropFilter="blur(1px)"
        px={4}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card
            w="600px"
            bg="whiteAlpha.800"
            boxShadow="2xl"
            borderRadius="3xl"
            p={6}
            border="1px solid"
            borderColor="whiteAlpha.300"
          >
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="xl" textAlign="center" color="gray.800">
                  Upload File
                </Heading>

                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={2} color={"gray.600"}>
                    Upload Excel File
                  </Text>
                  <Box
                    as="label"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    h="32"
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor="blue.500"
                    borderRadius="lg"
                    bg="blue.50"
                    _hover={{ bg: "blue.100" }}
                    cursor="pointer"
                    transition="all 0.3s"
                  >
                    <Icon as={UploadCloud} boxSize={8} color="blue.600" />
                    <Text color="gray.600">
                      {sheetNames.length > 0
                        ? `Sheets: ${sheetNames.join(", ")}`
                        : "Click or Drag & Drop"}
                    </Text>
                    <Input
                      type="file"
                      display="none"
                      onChange={handleFileChange}
                      accept=".xlsx, .xls, .csv"
                    />
                  </Box>
                  {selectedFile && (
                    <Text fontSize="sm" color="green.500" mt={2}>
                      {selectedFile.name}
                    </Text>
                  )}
                </Box>
              </VStack>
            </CardBody>
            <Button
              color="white"
              bg="blue.500"
              mt={4}
              _hover={{ bg: "blue.600" }}
              w="full"
              as={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewUploaded}
            >
              View Uploaded File
            </Button>
          </Card>
        </motion.div>
      </Flex>
    </>
  );
};

export default FileUploadPage;