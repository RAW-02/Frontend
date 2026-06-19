import Card from "../Card";

export default function KnowledgePanel() {
  const items = [
    {
      title: "Severity Distribution",
      text: "Shows how vulnerabilities are distributed across Critical, High, Medium and Low severity levels."
    },
    {
      title: "Top Vendors",
      text: "Vendors with the highest number of affected vulnerabilities."
    },
    {
      title: "Top CWEs",
      text: "Most common weakness categories across all indexed vulnerabilities."
    },
    {
      title: "EPSS",
      text: "Probability that a vulnerability will be exploited in the next 30 days."
    },
    {
      title: "Threat Score",
      text: "Overall risk score from multiple threat intelligence signals."
    }
  ];

  return (
    <Card
      title="Analytics Methodology"
      icon="ti-book"
      className="col-span-full"
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="
              rounded-xl
              border border-slate-800
              bg-slate-950/40
              p-4
            "
          >
            <h4 className="font-semibold text-cyan-400">
              {item.title}
            </h4>

            <p className="mt-2 text-sm text-slate-400">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}