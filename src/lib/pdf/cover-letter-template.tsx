import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { CandidateContact } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 60,
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: "#000000",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 24,
  },
  name: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginBottom: 2,
  },
  contactLine: {
    fontSize: 9.5,
  },
  date: {
    marginBottom: 18,
    fontSize: 10.5,
  },
  paragraph: {
    marginBottom: 12,
  },
});

export function CoverLetterDocument({
  coverLetter,
  contact,
  date,
}: {
  coverLetter: string;
  contact: CandidateContact;
  date: string;
}) {
  const paragraphs = coverLetter
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const contactItems = [contact.email, contact.phone, contact.location, ...contact.links].filter(
    Boolean,
  );

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.contactLine}>{contactItems.join("  |  ")}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

export function renderCoverLetterPdf(
  coverLetter: string,
  contact: CandidateContact,
  date: string,
) {
  return renderToBuffer(
    <CoverLetterDocument coverLetter={coverLetter} contact={contact} date={date} />,
  );
}
